package databases

import (
	"context"
	"errors"
	"fmt"
	"log"
	"regexp"
	"strings"
)

type SubscriptionResolver interface {
	GetActivePlan(ctx context.Context, userID string) (string, error)
}

type Service struct {
	repo         *Repository
	docker       *DockerProvisioner
	encryptionKey string
	subscriptions SubscriptionResolver
}

func NewService(repo *Repository, docker *DockerProvisioner, encryptionKey string, subscriptions SubscriptionResolver) *Service {
	return &Service{
		repo:          repo,
		docker:        docker,
		encryptionKey: encryptionKey,
		subscriptions: subscriptions,
	}
}

func (s *Service) List(ctx context.Context, userID string) ([]*Instance, error) {
	return s.repo.ListByUserID(ctx, userID)
}

func (s *Service) Create(ctx context.Context, userID string, req *CreateRequest) (*Instance, error) {
	if !isValidDBName(req.Name) {
		return nil, errors.New("nom invalide — 3 à 32 caractères, lettres minuscules, chiffres et tirets uniquement")
	}

	if s.repo.NameExists(ctx, userID, req.Name) {
		return nil, fmt.Errorf("une base nommée '%s' existe déjà", req.Name)
	}

	plan, err := s.subscriptions.GetActivePlan(ctx, userID)
	if err != nil {
		plan = "starter"
	}

	if err := s.checkQuota(ctx, userID, plan, req.Engine); err != nil {
		return nil, err
	}

	cfg, ok := engineConfig[req.Engine]
	if !ok {
		return nil, errors.New("moteur de base de données non supporté")
	}

	quota := PlanQuotas[plan]
	if quota.MaxStorageMB == 0 {
		quota = PlanQuotas["starter"]
	}

	password := generatePassword()
	username := generateUsername(req.Name)
	dbName := "db_" + sanitizeName(req.Name)
	passwordEnc, err := encryptPassword(password, s.encryptionKey)
	if err != nil {
		return nil, errors.New("erreur de chiffrement des identifiants")
	}

	inst := &Instance{
		UserID:         userID,
		Name:           req.Name,
		Engine:         req.Engine,
		Version:        cfg.Version,
		Status:         StatusCreating,
		Port:           cfg.Port,
		DatabaseName:   dbName,
		Username:       username,
		StorageMB:      quota.MaxStorageMB,
		MaxConnections: 50,
		NetworkName:    networkName,
	}

	record, err := s.repo.Create(ctx, inst, passwordEnc)
	if err != nil {
		return nil, errors.New("erreur lors de la création de l'instance")
	}

	go s.provisionAsync(record.ID, userID, req.Name, req.Engine, username, password, dbName)

	return record, nil
}

func (s *Service) provisionAsync(id, userID, name string, engine Engine, username, password, dbName string) {
	ctx := context.Background()

	dockerID, host, port, err := s.docker.Create(ctx, provisionParams{
		UserID:   userID,
		Name:     name,
		Engine:   engine,
		Username: username,
		Password: password,
		DBName:   dbName,
	})
	if err != nil {
		log.Printf("❌ Provisioning DB %s: %v", name, err)
		_ = s.repo.UpdateStatus(ctx, id, StatusError)
		return
	}

	if err := s.repo.UpdateActive(ctx, id, dockerID, host, port); err != nil {
		log.Printf("❌ Mise à jour DB instance %s: %v", id, err)
	}
	log.Printf("✅ Instance DB active: %s (%s)", name, engine)
}

func (s *Service) Get(ctx context.Context, userID, id string) (*InstanceWithCredentials, error) {
	inst, passwordEnc, err := s.repo.FindByIDInternal(ctx, id)
	if err != nil {
		return nil, err
	}
	if inst.UserID != userID {
		return nil, errors.New("accès refusé")
	}

	password, err := decryptPassword(passwordEnc, s.encryptionKey)
	if err != nil {
		return nil, errors.New("impossible de déchiffrer les identifiants")
	}

	return &InstanceWithCredentials{
		Instance:         *inst,
		Password:         password,
		ConnectionString: buildConnectionString(inst, password),
	}, nil
}

func (s *Service) Delete(ctx context.Context, userID, id string) error {
	inst, passwordEnc, err := s.repo.FindByIDInternal(ctx, id)
	if err != nil {
		return err
	}
	if inst.UserID != userID {
		return errors.New("accès refusé")
	}
	_ = passwordEnc

	_ = s.repo.UpdateStatus(ctx, id, StatusDeleting)

	if err := s.docker.Remove(ctx, inst.DockerID); err != nil {
		log.Printf("⚠️ Suppression Docker DB %s: %v", inst.Name, err)
	}

	return s.repo.MarkDeleted(ctx, id)
}

func (s *Service) ListUsers(ctx context.Context, userID, instanceID string) ([]*DBUser, error) {
	inst, err := s.repo.FindByID(ctx, instanceID, userID)
	if err != nil {
		return nil, err
	}
	return s.repo.ListUsers(ctx, inst.ID)
}

func (s *Service) Export(ctx context.Context, userID, instanceID string) (*Backup, error) {
	inst, err := s.repo.FindByID(ctx, instanceID, userID)
	if err != nil {
		return nil, err
	}
	if inst.Status != StatusActive {
		return nil, errors.New("l'instance doit être active pour exporter")
	}

	backup, err := s.repo.CreateBackup(ctx, inst.ID, "manual")
	if err != nil {
		return nil, errors.New("erreur lors de la planification de l'export")
	}

	go func() {
		path := fmt.Sprintf("/var/openspace/backups/%s/%s.sql", userID, inst.Name)
		_ = s.repo.CompleteBackup(context.Background(), backup.ID, path, 0)
	}()

	return backup, nil
}

func (s *Service) checkQuota(ctx context.Context, userID, plan string, engine Engine) error {
	quota, ok := PlanQuotas[plan]
	if !ok {
		quota = PlanQuotas["starter"]
	}

	if IsNoSQLEngine(engine) {
		count, err := s.repo.CountByUserAndType(ctx, userID, true)
		if err != nil {
			return err
		}
		if count >= quota.MaxNoSQL {
			return fmt.Errorf("quota NoSQL atteint pour le plan %s (%d max)", plan, quota.MaxNoSQL)
		}
		return nil
	}

	count, err := s.repo.CountByUserAndType(ctx, userID, false)
	if err != nil {
		return err
	}
	if count >= quota.MaxSQL {
		return fmt.Errorf("quota SQL atteint pour le plan %s (%d max)", plan, quota.MaxSQL)
	}
	return nil
}

func buildConnectionString(inst *Instance, password string) string {
	switch inst.Engine {
	case EngineMySQL:
		return fmt.Sprintf("mysql://%s:%s@%s:%d/%s", inst.Username, password, inst.Host, inst.Port, inst.DatabaseName)
	case EnginePostgreSQL:
		return fmt.Sprintf("postgresql://%s:%s@%s:%d/%s?sslmode=disable", inst.Username, password, inst.Host, inst.Port, inst.DatabaseName)
	case EngineMongoDB:
		return fmt.Sprintf("mongodb://%s:%s@%s:%d/%s?authSource=admin", inst.Username, password, inst.Host, inst.Port, inst.DatabaseName)
	case EngineRedis:
		return fmt.Sprintf("redis://:%s@%s:%d/0", password, inst.Host, inst.Port)
	default:
		return ""
	}
}

func isValidDBName(name string) bool {
	if len(name) < 3 || len(name) > 32 {
		return false
	}
	matched, _ := regexp.MatchString(`^[a-z][a-z0-9-]*[a-z0-9]$`, name)
	return matched
}

func IsValidEngine(engine string) bool {
	e := Engine(strings.ToLower(engine))
	_, ok := engineConfig[e]
	return ok
}
