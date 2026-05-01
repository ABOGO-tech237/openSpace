package admin

import (
	"context"
	"errors"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/openspace/backend/internal/provisioning"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

// GetAllContainers retourne tous les containers (admin seulement)
func (r *Repository) GetAllContainers(ctx context.Context) ([]*provisioning.Container, error) {
	query := `
		SELECT id, user_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb,
		       status, internal_ip, created_at, updated_at
		FROM containers
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var containers []*provisioning.Container
	for rows.Next() {
		container := &provisioning.Container{}
		if err := rows.Scan(
			&container.ID, &container.UserID, &container.DockerID, &container.Hostname,
			&container.Plan, &container.RAMLimit, &container.CPULimit,
			&container.StorageGB, &container.Status, &container.InternalIP,
			&container.CreatedAt, &container.UpdatedAt,
		); err != nil {
			log.Printf("Error scanning container: %v", err)
			continue
		}
		containers = append(containers, container)
	}

	return containers, rows.Err()
}

// GetContainerByID retourne un container spécifique
func (r *Repository) GetContainerByID(ctx context.Context, id string) (*provisioning.Container, error) {
	query := `
		SELECT id, user_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb,
		       status, internal_ip, created_at, updated_at
		FROM containers WHERE id = $1
	`

	c := &provisioning.Container{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.UserID, &c.DockerID, &c.Hostname,
		&c.Plan, &c.RAMLimit, &c.CPULimit,
		&c.StorageGB, &c.Status, &c.InternalIP,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("container introuvable")
	}
	return c, nil
}

// DeleteContainer supprime un container
func (r *Repository) DeleteContainer(ctx context.Context, id string) error {
	query := `DELETE FROM containers WHERE id = $1`
	_, err := r.db.Exec(ctx, query, id)
	return err
}

// UpdateContainerStatus met à jour le statut
func (r *Repository) UpdateContainerStatus(ctx context.Context, id, status string) error {
	query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

// GetContainerStats retourne les stats utilisées (mock pour maintenant)
func (r *Repository) GetContainerStats(ctx context.Context, id string) (map[string]interface{}, error) {
	// TODO: Intégrer avec Docker stats API
	return map[string]interface{}{
		"cpu":     "15%",
		"memory":  "256MB",
		"network": "1.2MB in, 0.8MB out",
	}, nil
}
