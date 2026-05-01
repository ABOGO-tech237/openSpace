package subscription

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, s *Subscription) (*Subscription, error) {
	query := `
		INSERT INTO subscriptions (user_id, payment_id, plan, status, started_at, expires_at, auto_renew)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, user_id, payment_id, plan, status, started_at, expires_at, auto_renew, cancelled_at, created_at, updated_at
	`

	created := &Subscription{}
	err := r.db.QueryRow(ctx, query,
		s.UserID, s.PaymentID, s.Plan, s.Status, s.StartedAt, s.ExpiresAt, s.AutoRenew,
	).Scan(
		&created.ID, &created.UserID, &created.PaymentID,
		&created.Plan, &created.Status, &created.StartedAt, &created.ExpiresAt,
		&created.AutoRenew, &created.CancelledAt, &created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("erreur lors de la création de l'abonnement")
	}

	return created, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*Subscription, error) {
	query := `
		SELECT id, user_id, payment_id, plan, status, started_at, expires_at, auto_renew, cancelled_at, created_at, updated_at
		FROM subscriptions WHERE id = $1
	`

	s := &Subscription{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&s.ID, &s.UserID, &s.PaymentID,
		&s.Plan, &s.Status, &s.StartedAt, &s.ExpiresAt,
		&s.AutoRenew, &s.CancelledAt, &s.CreatedAt, &s.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("abonnement introuvable")
	}

	return s, nil
}

func (r *Repository) FindActiveByUserID(ctx context.Context, userID string) (*SubscriptionWithContainer, error) {
	query := `
		SELECT
			s.id, s.user_id, s.payment_id, s.plan, s.status, s.started_at, s.expires_at, s.auto_renew, s.created_at, s.updated_at,
			c.id, c.hostname, c.status, c.internal_ip
		FROM subscriptions s
		LEFT JOIN containers c ON c.subscription_id = s.id
		WHERE s.user_id = $1 AND s.status = 'active'
		LIMIT 1
	`

	swc := &SubscriptionWithContainer{}
	var containerID, hostname, containerStatus, internalIP *string

	err := r.db.QueryRow(ctx, query, userID).Scan(
		&swc.ID, &swc.UserID, &swc.PaymentID, &swc.Plan, &swc.Status,
		&swc.StartedAt, &swc.ExpiresAt, &swc.AutoRenew, &swc.CreatedAt, &swc.UpdatedAt,
		&containerID, &hostname, &containerStatus, &internalIP,
	)

	if err != nil {
		return nil, errors.New("aucun abonnement actif trouvé")
	}

	// Si container existe, l'ajouter
	if containerID != nil && hostname != nil {
		swc.Container = &ContainerInfo{
			ID:       *containerID,
			Hostname: *hostname,
			Status:   *containerStatus,
		}
		if internalIP != nil {
			swc.Container.InternalIP = *internalIP
		}
	}

	return swc, nil
}

func (r *Repository) UpdateContainerID(ctx context.Context, id, containerID string) error {
	query := `
		UPDATE containers
		SET subscription_id = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, id, containerID)
	return err
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status SubscriptionStatus) error {
	query := `
		UPDATE subscriptions
		SET status = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, status, id)
	return err
}

func (r *Repository) Cancel(ctx context.Context, userID string) error {
	query := `
		UPDATE subscriptions
		SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
		WHERE user_id = $1 AND status = 'active'
	`

	result, err := r.db.Exec(ctx, query, userID)
	if err != nil {
		return err
	}

	if result.RowsAffected() == 0 {
		return errors.New("aucun abonnement actif à annuler")
	}

	return nil
}

func (r *Repository) FindExpired(ctx context.Context) ([]*Subscription, error) {
	query := `
		SELECT s.id, s.user_id, c.id, s.payment_id, s.plan, s.status, s.started_at, s.expires_at, s.auto_renew, s.cancelled_at, s.created_at, s.updated_at
		FROM subscriptions s
		LEFT JOIN containers c ON c.subscription_id = s.id
		WHERE s.status = 'active' AND s.expires_at < NOW()
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	subscriptions := []*Subscription{}
	for rows.Next() {
		s := &Subscription{}
		err := rows.Scan(
			&s.ID, &s.UserID, &s.ContainerID, &s.PaymentID,
			&s.Plan, &s.Status, &s.StartedAt, &s.ExpiresAt,
			&s.AutoRenew, &s.CancelledAt, &s.CreatedAt, &s.UpdatedAt,
		)
		if err != nil {
			continue
		}
		subscriptions = append(subscriptions, s)
	}

	return subscriptions, nil
}

func (r *Repository) SetExpiresAt(ctx context.Context, id string, expiresAt time.Time) error {
	query := `
		UPDATE subscriptions
		SET expires_at = $1, updated_at = NOW()
		WHERE id = $2
	`

	_, err := r.db.Exec(ctx, query, expiresAt, id)
	return err
}
