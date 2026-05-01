package provisioning

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, c *Container) (*Container, error) {
	query := `
		INSERT INTO containers (user_id, subscription_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb, status, internal_ip)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, user_id, subscription_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb, status, internal_ip, created_at, updated_at
	`
	created := &Container{}
	err := r.db.QueryRow(ctx, query,
		c.UserID, c.SubscriptionID, c.DockerID, c.Hostname, c.Plan,
		c.RAMLimit, c.CPULimit, c.StorageGB, c.Status, c.InternalIP,
	).Scan(
		&created.ID, &created.UserID, &created.SubscriptionID, &created.DockerID, &created.Hostname,
		&created.Plan, &created.RAMLimit, &created.CPULimit,
		&created.StorageGB, &created.Status, &created.InternalIP,
		&created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (r *Repository) FindByUserID(ctx context.Context, userID string) (*Container, error) {
	query := `
		SELECT id, user_id, subscription_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb, status, internal_ip, created_at, updated_at
		FROM containers WHERE user_id = $1
	`
	c := &Container{}
	err := r.db.QueryRow(ctx, query, userID).Scan(
		&c.ID, &c.UserID, &c.SubscriptionID, &c.DockerID, &c.Hostname,
		&c.Plan, &c.RAMLimit, &c.CPULimit,
		&c.StorageGB, &c.Status, &c.InternalIP,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("container introuvable")
	}
	return c, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*Container, error) {
	query := `
		SELECT id, user_id, subscription_id, docker_id, hostname, plan, ram_limit, cpu_limit, storage_gb, status, internal_ip, created_at, updated_at
		FROM containers WHERE id = $1
	`
	c := &Container{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&c.ID, &c.UserID, &c.SubscriptionID, &c.DockerID, &c.Hostname,
		&c.Plan, &c.RAMLimit, &c.CPULimit,
		&c.StorageGB, &c.Status, &c.InternalIP,
		&c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("container introuvable")
	}
	return c, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id, status string) error {
	query := `UPDATE containers SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) UpdateDockerID(ctx context.Context, id, dockerID, ip string) error {
	query := `UPDATE containers SET docker_id = $1, internal_ip = $2, status = 'running', updated_at = NOW() WHERE id = $3`
	_, err := r.db.Exec(ctx, query, dockerID, ip, id)
	return err
}

func (r *Repository) HostnameExists(ctx context.Context, hostname string) bool {
	var exists bool
	r.db.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM containers WHERE hostname = $1)`, hostname).Scan(&exists)
	return exists
}
