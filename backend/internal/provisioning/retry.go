package provisioning

import (
	"context"
	"fmt"
	"log"
	"math"
	"math/rand"
	"time"
)

// RetryConfig contrôle la logique de retry
type RetryConfig struct {
	MaxRetries        int
	InitialDelay      time.Duration
	MaxDelay          time.Duration
	BackoffMultiplier float64
}

// DefaultRetryConfig retourne les paramètres par défaut
func DefaultRetryConfig() RetryConfig {
	return RetryConfig{
		MaxRetries:        3,
		InitialDelay:      2 * time.Second,
		MaxDelay:          30 * time.Second,
		BackoffMultiplier: 2.0,
	}
}

// exponentialBackoff calcule le délai avec backoff exponentiel + jitter
func exponentialBackoff(attempt int, config RetryConfig) time.Duration {
	delay := time.Duration(float64(config.InitialDelay) * math.Pow(config.BackoffMultiplier, float64(attempt)))

	// Cap au MaxDelay
	if delay > config.MaxDelay {
		delay = config.MaxDelay
	}

	// Ajouter du jitter (0-25% variation)
	jitter := time.Duration(rand.Intn(int(delay) / 4))
	return delay + jitter
}

// ProvisionWithRetry crée un container avec retry logic
func (s *Service) ProvisionWithRetry(ctx context.Context, req *ProvisionRequest, retryConfig ...RetryConfig) (*Container, error) {
	cfg := DefaultRetryConfig()
	if len(retryConfig) > 0 {
		cfg = retryConfig[0]
	}

	// Créer l'enregistrement initial (optimiste)
	planCfg, ok := Plans[req.Plan]
	if !ok {
		return nil, fmt.Errorf("plan invalide: %s", req.Plan)
	}

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
		return nil, fmt.Errorf("erreur création enregistrement: %w", err)
	}

	// Lancer le provisioning Docker avec retry en arrière-plan
	go s.provisionDockerWithRetry(context.Background(), record, req, cfg)

	return record, nil
}

// provisionDockerWithRetry tente de créer le container Docker avec retry
func (s *Service) provisionDockerWithRetry(ctx context.Context, container *Container, req *ProvisionRequest, cfg RetryConfig) {
	var lastErr error

	for attempt := 0; attempt < cfg.MaxRetries; attempt++ {
		// Attendre avant la tentative (sauf pour la première)
		if attempt > 0 {
			delay := exponentialBackoff(attempt-1, cfg)
			log.Printf("⏳ Retry provisioning %s — attente %v (tentative %d/%d)", req.Hostname, delay, attempt, cfg.MaxRetries)
			select {
			case <-time.After(delay):
			case <-ctx.Done():
				s.repo.UpdateStatus(ctx, container.ID, "error")
				return
			}
		}

		// Tenter de créer le container Docker
		dockerID, err := s.docker.CreateContainer(ctx, req)
		if err == nil {
			// Succès! Récupérer l'IP
			ip, ipErr := s.docker.GetContainerIP(ctx, dockerID)
			if ipErr != nil {
				log.Printf("⚠️ Container créé mais IP introuvable pour %s: %v", req.Hostname, ipErr)
				ip = ""
			}

			// Mettre à jour la base
			if err := s.repo.UpdateDockerID(ctx, container.ID, dockerID, ip); err != nil {
				log.Printf("❌ Erreur mise à jour BDD pour %s: %v", req.Hostname, err)
				return
			}

			log.Printf("✅ Provisioning réussi (tentative %d): %s.openspace.cm → %s", attempt+1, req.Hostname, ip)
			return
		}

		// Erreur — logger et continuer
		lastErr = err
		log.Printf("❌ Tentative %d échouée pour %s: %v", attempt+1, req.Hostname, err)
	}

	// Tous les retries ont échoué
	log.Printf("❌ Provisioning failed after %d attempts for %s: %v", cfg.MaxRetries, req.Hostname, lastErr)
	s.repo.UpdateStatus(ctx, container.ID, "error")
}

// Health check pour vérifier si un container Docker est vraiment fonctionnel
func (s *Service) HealthCheckContainer(ctx context.Context, container *Container) (bool, error) {
	if container.DockerID == "pending" || container.DockerID == "" {
		return false, fmt.Errorf("container Docker ID pas encore disponible")
	}

	inspect, err := s.docker.cli.ContainerInspect(ctx, container.DockerID)
	if err != nil {
		return false, fmt.Errorf("erreur inspection container: %w", err)
	}

	// Vérifier que le container est running
	if !inspect.State.Running {
		return false, fmt.Errorf("container n'est pas en running state: %s", inspect.State.Status)
	}

	// Vérifier que l'IP est assignée
	if container.InternalIP == "" {
		return false, fmt.Errorf("container n'a pas d'IP assignée")
	}

	return true, nil
}
