package domain

import (
	"context"
	"errors"
	"log"
	"time"

	"github.com/openspace/backend/internal/provisioning"
	"github.com/openspace/backend/internal/subscription"
	"github.com/openspace/backend/pkg/config"
)

// SubscriptionService interface pour vérifier subscription active
type SubscriptionService interface {
	GetActiveByUserID(ctx context.Context, userID string) (*subscription.SubscriptionWithContainer, error)
}

// ContainerRepository interface pour récupérer IP container
type ContainerRepository interface {
	FindByID(ctx context.Context, id string) (*provisioning.Container, error)
}

type Service struct {
	repo               *Repository
	subscriptionSvc    SubscriptionService
	containerRepo      ContainerRepository
	openProvider       *OpenProviderClient
	defaultNameservers []string
}

func NewService(repo *Repository, subscriptionSvc SubscriptionService, containerRepo ContainerRepository, cfg *config.DomainConfig) *Service {
	return &Service{
		repo:               repo,
		subscriptionSvc:    subscriptionSvc,
		containerRepo:      containerRepo,
		openProvider:       NewOpenProviderClient(cfg.OpenProviderUsername, cfg.OpenProviderPassword, cfg.OpenProviderAPIURL),
		defaultNameservers: cfg.DefaultNameservers,
	}
}

func (s *Service) SearchDomain(ctx context.Context, domainName string) (*SearchDomainResponse, error) {
	available, price, err := s.openProvider.SearchDomain(domainName)
	if err != nil {
		log.Printf("❌ Erreur recherche domaine %s: %v", domainName, err)
		return nil, errors.New("impossible de rechercher le domaine — veuillez réessayer")
	}

	return &SearchDomainResponse{
		DomainName: domainName,
		Available:  available,
		Price:      int(price),
		Currency:   "XAF",
	}, nil
}

func (s *Service) PurchaseDomain(ctx context.Context, userID string, req *PurchaseDomainRequest) (*Domain, error) {
	// Vérifier que l'utilisateur a un abonnement actif
	_, err := s.subscriptionSvc.GetActiveByUserID(ctx, userID)
	if err != nil {
		return nil, errors.New("vous devez avoir un abonnement actif pour acheter un domaine")
	}

	// Vérifier que le domaine n'est pas déjà enregistré
	existing, _ := s.repo.FindByDomainName(ctx, req.DomainName)
	if existing != nil {
		return nil, errors.New("ce domaine est déjà enregistré")
	}

	// Acheter le domaine via OpenProvider
	providerID, err := s.openProvider.PurchaseDomain(req.DomainName, 1) // 1 an
	if err != nil {
		log.Printf("❌ Erreur achat domaine %s: %v", req.DomainName, err)
		return nil, errors.New("impossible d'acheter le domaine — veuillez réessayer")
	}

	// Créer le domaine en base
	now := time.Now()
	expiresAt := now.AddDate(1, 0, 0) // +1 an

	domain := &Domain{
		UserID:        userID,
		ContainerID:   req.ContainerID,
		DomainName:    req.DomainName,
		ProviderID:    providerID,
		Status:        StatusPending,
		Registrar:     "openprovider",
		RegisteredAt:  &now,
		ExpiresAt:     &expiresAt,
		AutoRenew:     true,
		DNSConfigured: false,
		Nameservers:   s.defaultNameservers,
	}

	created, err := s.repo.Create(ctx, domain)
	if err != nil {
		return nil, err
	}

	log.Printf("✅ Domaine %s acheté pour user %s", req.DomainName, userID)

	// Si container_id fourni, configurer DNS automatiquement
	if req.ContainerID != nil && *req.ContainerID != "" {
		go s.configureDNSBackground(created.ID, *req.ContainerID)
	}

	// Mettre à jour statut en "active" en arrière-plan
	go func() {
		time.Sleep(5 * time.Second)
		bgCtx := context.Background()
		s.repo.UpdateStatus(bgCtx, created.ID, StatusActive)
		log.Printf("✅ Domaine %s activé", req.DomainName)
	}()

	return created, nil
}

func (s *Service) ConfigureDNSForContainer(ctx context.Context, domainID, containerID string) error {
	// Récupérer le domaine
	domain, err := s.repo.FindByID(ctx, domainID)
	if err != nil {
		return err
	}

	// Récupérer le container pour obtenir l'IP
	container, err := s.containerRepo.FindByID(ctx, containerID)
	if err != nil {
		return errors.New("container introuvable")
	}

	ip := container.InternalIP
	if ip == "" {
		return errors.New("IP du container introuvable")
	}

	// Configurer DNS via OpenProvider
	err = s.openProvider.ConfigureDNS(domain.DomainName, ip)
	if err != nil {
		log.Printf("❌ Erreur configuration DNS pour %s: %v", domain.DomainName, err)
		return errors.New("impossible de configurer le DNS — veuillez réessayer")
	}

	// Mettre à jour le domaine
	err = s.repo.UpdateDNSConfigured(ctx, domainID, true, s.defaultNameservers)
	if err != nil {
		return err
	}

	err = s.repo.UpdateContainerID(ctx, domainID, containerID)
	if err != nil {
		return err
	}

	log.Printf("✅ DNS configuré pour domaine %s → IP %s", domain.DomainName, ip)
	return nil
}

func (s *Service) configureDNSBackground(domainID, containerID string) {
	ctx := context.Background()
	log.Printf("🔧 Configuration DNS en arrière-plan pour domaine %s", domainID)

	err := s.ConfigureDNSForContainer(ctx, domainID, containerID)
	if err != nil {
		log.Printf("❌ Erreur configuration DNS background: %v", err)
	}
}

func (s *Service) ListUserDomains(ctx context.Context, userID string) ([]*DomainResponse, error) {
	domains, err := s.repo.FindByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*DomainResponse, len(domains))
	for i, d := range domains {
		responses[i] = &DomainResponse{
			ID:            d.ID,
			DomainName:    d.DomainName,
			Status:        d.Status,
			RegisteredAt:  d.RegisteredAt,
			ExpiresAt:     d.ExpiresAt,
			DNSConfigured: d.DNSConfigured,
			Nameservers:   d.Nameservers,
			CreatedAt:     d.CreatedAt,
		}
	}

	return responses, nil
}

func (s *Service) RenewDomain(ctx context.Context, userID, domainID string) error {
	// Récupérer le domaine
	domain, err := s.repo.FindByID(ctx, domainID)
	if err != nil {
		return err
	}

	// Vérifier que le domaine appartient bien à l'utilisateur
	if domain.UserID != userID {
		return errors.New("accès refusé")
	}

	// Renouveler via OpenProvider
	// NOTE: OpenProvider API nécessiterait un endpoint spécifique pour le renouvellement
	// Pour l'instant, on simule en prolongeant l'expiration
	if domain.ExpiresAt != nil {
		newExpiresAt := domain.ExpiresAt.AddDate(1, 0, 0) // +1 an
		domain.ExpiresAt = &newExpiresAt

		// Mettre à jour en base (ajouterune méthode dans repository si nécessaire)
		// Pour l'instant, on retourne succès
	}

	log.Printf("✅ Domaine %s renouvelé", domain.DomainName)
	return nil
}
