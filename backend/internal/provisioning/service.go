package provisioning

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
)

type Service struct {
	repo   *Repository
	docker *DockerClient
}

func NewService(repo *Repository, docker *DockerClient) *Service {
	return &Service{repo: repo, docker: docker}
}

func (s *Service) Provision(ctx context.Context, req *ProvisionRequest) (*Container, error) {
	// Valider le hostname — lettres, chiffres, tirets uniquement
	if !isValidHostname(req.Hostname) {
		return nil, errors.New("nom d'hôte invalide — utilisez uniquement des lettres, chiffres et tirets")
	}

	// Vérifier que le hostname est disponible
	if s.repo.HostnameExists(ctx, req.Hostname) {
		return nil, fmt.Errorf("le nom '%s' est déjà pris", req.Hostname)
	}

	// Vérifier que le plan existe
	planCfg, ok := Plans[req.Plan]
	if !ok {
		return nil, errors.New("plan invalide")
	}

	// Créer l'entrée en base avec statut "provisioning"
	containerRecord := &Container{
		UserID:     req.UserID,
		Hostname:   req.Hostname,
		Plan:       req.Plan,
		RAMLimit:   planCfg.RAM,
		CPULimit:   planCfg.CPUs,
		StorageGB:  planCfg.Storage,
		Status:     "provisioning",
		DockerID:   "pending",
		InternalIP: "",
	}

	record, err := s.repo.Create(ctx, containerRecord)
	if err != nil {
		return nil, errors.New("erreur lors de l'initialisation du container")
	}

	// Provisioning Docker en arrière-plan
	go func() {
		bgCtx := context.Background()

		dockerID, err := s.docker.CreateContainer(bgCtx, req)
		if err != nil {
			log.Printf("❌ Erreur provisioning %s: %v", req.Hostname, err)
			s.repo.UpdateStatus(bgCtx, record.ID, "error")
			return
		}

		// Récupérer l'IP interne du container
		ip, err := s.docker.GetContainerIP(bgCtx, dockerID)
		if err != nil {
			log.Printf("⚠️ Container créé mais IP introuvable: %v", err)
			ip = ""
		}

		// Mettre à jour la base avec le vrai Docker ID et l'IP
		if err := s.repo.UpdateDockerID(bgCtx, record.ID, dockerID, ip); err != nil {
			log.Printf("❌ Erreur mise à jour BDD: %v", err)
		}

		log.Printf("✅ Provisioning terminé: %s.openspace.cm → %s", req.Hostname, ip)
	}()

	return record, nil
}

func (s *Service) GetByUserID(ctx context.Context, userID string) (*Container, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *Service) Deprovision(ctx context.Context, userID string) error {
	container, err := s.repo.FindByUserID(ctx, userID)
	if err != nil {
		return errors.New("aucun container trouvé pour cet utilisateur")
	}

	if err := s.docker.StopContainer(ctx, container.DockerID); err != nil {
		log.Printf("⚠️ Erreur arrêt container %s: %v", container.DockerID, err)
	}

	if err := s.docker.RemoveContainer(ctx, container.DockerID); err != nil {
		return fmt.Errorf("erreur suppression container: %w", err)
	}

	s.repo.UpdateStatus(ctx, container.ID, "removed")
	return nil
}

// SubscriptionRepository interface pour mettre à jour container_id
type SubscriptionRepository interface {
	UpdateContainerID(ctx context.Context, subscriptionID, containerID string) error
}

// ProvisionWithSubscription crée un container après paiement validé
func (s *Service) ProvisionWithSubscription(ctx context.Context, subscriptionID, userID, plan, hostname string) error {
	// Valider le hostname
	if !isValidHostname(hostname) {
		return errors.New("nom d'hôte invalide — utilisez uniquement des lettres, chiffres et tirets")
	}

	// Vérifier disponibilité du hostname
	if s.repo.HostnameExists(ctx, hostname) {
		return fmt.Errorf("le nom '%s' est déjà pris", hostname)
	}

	// Vérifier que le plan existe
	planCfg, ok := Plans[Plan(plan)]
	if !ok {
		return errors.New("plan invalide")
	}

	// Créer l'entrée container avec subscription_id
	containerRecord := &Container{
		UserID:         userID,
		Hostname:       hostname,
		Plan:           Plan(plan),
		RAMLimit:       planCfg.RAM,
		CPULimit:       planCfg.CPUs,
		StorageGB:      planCfg.Storage,
		Status:         "provisioning",
		DockerID:       "pending",
		InternalIP:     "",
		SubscriptionID: &subscriptionID,
	}

	record, err := s.repo.Create(ctx, containerRecord)
	if err != nil {
		log.Printf("❌ Erreur création container pour subscription %s: %v", subscriptionID, err)
		return errors.New("erreur lors de l'initialisation du container")
	}

	// Provisioning Docker en arrière-plan
	go func() {
		bgCtx := context.Background()

		// Créer la request
		req := &ProvisionRequest{
			UserID:   userID,
			Hostname: hostname,
			Plan:     Plan(plan),
		}

		dockerID, err := s.docker.CreateContainer(bgCtx, req)
		if err != nil {
			log.Printf("❌ Erreur provisioning Docker %s: %v", hostname, err)
			s.repo.UpdateStatus(bgCtx, record.ID, "error")
			return
		}

		// Récupérer l'IP
		ip, err := s.docker.GetContainerIP(bgCtx, dockerID)
		if err != nil {
			log.Printf("⚠️ Container créé mais IP introuvable: %v", err)
			ip = ""
		}

		// Mettre à jour la base avec Docker ID et IP
		if err := s.repo.UpdateDockerID(bgCtx, record.ID, dockerID, ip); err != nil {
			log.Printf("❌ Erreur mise à jour BDD: %v", err)
			return
		}

		log.Printf("✅ Provisioning terminé pour subscription %s: %s.openspace.cm → %s", subscriptionID, hostname, ip)
	}()

	return nil
}

// StopContainer arrête un container (pour expiration subscription)
func (s *Service) StopContainer(ctx context.Context, containerID string) error {
	// Récupérer le container
	container, err := s.repo.FindByID(ctx, containerID)
	if err != nil {
		return errors.New("container introuvable")
	}

	// Arrêter le container Docker
	if err := s.docker.StopContainer(ctx, container.DockerID); err != nil {
		log.Printf("⚠️ Erreur arrêt container %s: %v", container.DockerID, err)
		return err
	}

	// Mettre à jour le statut en "stopped"
	if err := s.repo.UpdateStatus(ctx, containerID, "stopped"); err != nil {
		return err
	}

	log.Printf("✅ Container %s arrêté (subscription expirée)", container.Hostname)
	return nil
}

func isValidHostname(hostname string) bool {
	if len(hostname) < 3 || len(hostname) > 30 {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-z0-9][a-z0-9-]*[a-z0-9]$`, hostname)
	return matched
}
