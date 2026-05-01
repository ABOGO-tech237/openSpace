package subscription

import (
	"context"
	"errors"
	"log"
	"time"
)

// ProvisioningService interface pour éviter les dépendances circulaires
type ProvisioningService interface {
	ProvisionWithSubscription(ctx context.Context, subscriptionID, userID, plan, hostname string) error
	StopContainer(ctx context.Context, containerID string) error
}

type Service struct {
	repo              *Repository
	provisioningService ProvisioningService
}

func NewService(repo *Repository, provisioningService ProvisioningService) *Service {
	return &Service{
		repo:              repo,
		provisioningService: provisioningService,
	}
}

func (s *Service) CreateFromPayment(ctx context.Context, userID, paymentID, plan, hostname string) (*Subscription, error) {
	// Vérifier qu'il n'y a pas déjà un abonnement actif
	existing, _ := s.repo.FindActiveByUserID(ctx, userID)
	if existing != nil {
		return nil, errors.New("vous avez déjà un abonnement actif")
	}

	// Calculer la date d'expiration (30 jours)
	now := time.Now()
	expiresAt := now.AddDate(0, 0, 30) // +30 jours

	// Créer l'abonnement
	subscription := &Subscription{
		UserID:    userID,
		PaymentID: paymentID,
		Plan:      plan,
		Status:    StatusActive,
		StartedAt: now,
		ExpiresAt: expiresAt,
		AutoRenew: false,
	}

	created, err := s.repo.Create(ctx, subscription)
	if err != nil {
		return nil, err
	}

	log.Printf("Subscription créé: %s pour user %s, plan %s", created.ID, userID, plan)

	// Déclencher le provisioning en arrière-plan
	go func() {
		bgCtx := context.Background()
		log.Printf("Démarrage provisioning pour subscription %s", created.ID)

		err := s.provisioningService.ProvisionWithSubscription(
			bgCtx,
			created.ID,
			userID,
			plan,
			hostname,
		)

		if err != nil {
			log.Printf("Erreur provisioning pour subscription %s: %v", created.ID, err)
			// Ne pas échouer la subscription si le provisioning échoue
			// L'utilisateur devra réessayer ou contacter le support
		} else {
			log.Printf("Provisioning terminé pour subscription %s", created.ID)
		}
	}()

	return created, nil
}

func (s *Service) GetActiveByUserID(ctx context.Context, userID string) (*SubscriptionWithContainer, error) {
	return s.repo.FindActiveByUserID(ctx, userID)
}

func (s *Service) Cancel(ctx context.Context, userID string) error {
	// Récupérer l'abonnement actif
	sub, err := s.repo.FindActiveByUserID(ctx, userID)
	if err != nil {
		return errors.New("aucun abonnement actif à annuler")
	}

	// Annuler l'abonnement
	err = s.repo.Cancel(ctx, userID)
	if err != nil {
		return err
	}

	// Si un container existe, l'arrêter
	if sub.Container != nil {
		go func() {
			bgCtx := context.Background()
			log.Printf("Arrêt du container %s suite à annulation", sub.Container.ID)

			err := s.provisioningService.StopContainer(bgCtx, sub.Container.ID)
			if err != nil {
				log.Printf("❌ Erreur arrêt container %s: %v", sub.Container.ID, err)
			}
		}()
	}

	log.Printf("Abonnement annulé pour user %s", userID)
	return nil
}

func (s *Service) CheckAndExpire(ctx context.Context) error {
	// Récupérer tous les abonnements expirés
	expired, err := s.repo.FindExpired(ctx)
	if err != nil {
		return err
	}

	log.Printf("%d abonnement(s) expiré(s) trouvé(s)", len(expired))

	for _, sub := range expired {
		// Mettre à jour le statut en expiré
		err := s.repo.UpdateStatus(ctx, sub.ID, StatusExpired)
		if err != nil {
			log.Printf("❌ Erreur mise à jour statut subscription %s: %v", sub.ID, err)
			continue
		}

		log.Printf("Subscription %s expiré", sub.ID)

		// Arrêter le container si existe
		if sub.ContainerID != nil && *sub.ContainerID != "" {
			go func(containerID string) {
				bgCtx := context.Background()
				log.Printf("Arrêt du container %s (subscription expirée)", containerID)

				err := s.provisioningService.StopContainer(bgCtx, containerID)
				if err != nil {
					log.Printf("❌ Erreur arrêt container %s: %v", containerID, err)
				}
			}(*sub.ContainerID)
		}
	}

	return nil
}

func (s *Service) Renew(ctx context.Context, userID, newPaymentID string) error {
	// Récupérer l'abonnement (actif ou expiré)
	sub, err := s.repo.FindActiveByUserID(ctx, userID)
	if err != nil {
		// Si pas trouvé comme actif, chercher si expiré récemment
		return errors.New("abonnement introuvable")
	}

	// Prolonger de 30 jours
	newExpiresAt := time.Now().AddDate(0, 0, 30)
	err = s.repo.SetExpiresAt(ctx, sub.ID, newExpiresAt)
	if err != nil {
		return err
	}

	// Réactiver si expiré
	if sub.Status == StatusExpired {
		err = s.repo.UpdateStatus(ctx, sub.ID, StatusActive)
		if err != nil {
			return err
		}
	}

	log.Printf("Abonnement %s renouvelé pour user %s", sub.ID, userID)
	return nil
}

func (s *Service) UpdateContainerID(ctx context.Context, subscriptionID, containerID string) error {
	return s.repo.UpdateContainerID(ctx, subscriptionID, containerID)
}
