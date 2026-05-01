package domain

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lib/pq"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, d *Domain) (*Domain, error) {
	query := `
		INSERT INTO domains (user_id, container_id, domain_name, provider_id, status, registrar, registered_at, expires_at, auto_renew, dns_configured, nameservers)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, user_id, container_id, domain_name, provider_id, status, registrar, registered_at, expires_at, auto_renew, dns_configured, nameservers, created_at, updated_at
	`

	created := &Domain{}
	err := r.db.QueryRow(ctx, query,
		d.UserID, d.ContainerID, d.DomainName, d.ProviderID, d.Status,
		d.Registrar, d.RegisteredAt, d.ExpiresAt, d.AutoRenew, d.DNSConfigured,
		pq.Array(d.Nameservers),
	).Scan(
		&created.ID, &created.UserID, &created.ContainerID, &created.DomainName,
		&created.ProviderID, &created.Status, &created.Registrar, &created.RegisteredAt,
		&created.ExpiresAt, &created.AutoRenew, &created.DNSConfigured,
		pq.Array(&created.Nameservers), &created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("erreur lors de la création du domaine")
	}

	return created, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*Domain, error) {
	query := `
		SELECT id, user_id, container_id, domain_name, provider_id, status, registrar, registered_at, expires_at, auto_renew, dns_configured, nameservers, created_at, updated_at
		FROM domains WHERE id = $1
	`

	d := &Domain{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&d.ID, &d.UserID, &d.ContainerID, &d.DomainName,
		&d.ProviderID, &d.Status, &d.Registrar, &d.RegisteredAt,
		&d.ExpiresAt, &d.AutoRenew, &d.DNSConfigured,
		pq.Array(&d.Nameservers), &d.CreatedAt, &d.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("domaine introuvable")
	}

	return d, nil
}

func (r *Repository) FindByDomainName(ctx context.Context, domainName string) (*Domain, error) {
	query := `
		SELECT id, user_id, container_id, domain_name, provider_id, status, registrar, registered_at, expires_at, auto_renew, dns_configured, nameservers, created_at, updated_at
		FROM domains WHERE domain_name = $1
	`

	d := &Domain{}
	err := r.db.QueryRow(ctx, query, domainName).Scan(
		&d.ID, &d.UserID, &d.ContainerID, &d.DomainName,
		&d.ProviderID, &d.Status, &d.Registrar, &d.RegisteredAt,
		&d.ExpiresAt, &d.AutoRenew, &d.DNSConfigured,
		pq.Array(&d.Nameservers), &d.CreatedAt, &d.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("domaine introuvable")
	}

	return d, nil
}

func (r *Repository) FindByUserID(ctx context.Context, userID string) ([]*Domain, error) {
	query := `
		SELECT id, user_id, container_id, domain_name, provider_id, status, registrar, registered_at, expires_at, auto_renew, dns_configured, nameservers, created_at, updated_at
		FROM domains
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, errors.New("erreur lors de la récupération des domaines")
	}
	defer rows.Close()

	domains := []*Domain{}
	for rows.Next() {
		d := &Domain{}
		err := rows.Scan(
			&d.ID, &d.UserID, &d.ContainerID, &d.DomainName,
			&d.ProviderID, &d.Status, &d.Registrar, &d.RegisteredAt,
			&d.ExpiresAt, &d.AutoRenew, &d.DNSConfigured,
			pq.Array(&d.Nameservers), &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			continue
		}
		domains = append(domains, d)
	}

	return domains, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status DomainStatus) error {
	query := `
		UPDATE domains
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) UpdateDNSConfigured(ctx context.Context, id string, configured bool, nameservers []string) error {
	query := `
		UPDATE domains
		SET dns_configured = $1, nameservers = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err := r.db.Exec(ctx, query, configured, pq.Array(nameservers), id)
	return err
}

func (r *Repository) UpdateContainerID(ctx context.Context, id, containerID string) error {
	query := `
		UPDATE domains
		SET container_id = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, containerID, id)
	return err
}
