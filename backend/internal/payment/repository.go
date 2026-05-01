package payment

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, p *Payment) (*Payment, error) {
	metadataJSON, _ := json.Marshal(p.Metadata)
	webhookDataJSON, _ := json.Marshal(p.WebhookData)

	query := `
		INSERT INTO payments (user_id, transaction_id, provider, amount, status, plan, payment_method, phone_number, metadata, webhook_data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id, user_id, transaction_id, provider, amount, status, plan, payment_method, phone_number, metadata, webhook_data, created_at, updated_at
	`

	created := &Payment{}
	var metadataStr, webhookDataStr []byte

	err := r.db.QueryRow(ctx, query,
		p.UserID, p.TransactionID, p.Provider, p.Amount, p.Status,
		p.Plan, p.PaymentMethod, p.PhoneNumber, metadataJSON, webhookDataJSON,
	).Scan(
		&created.ID, &created.UserID, &created.TransactionID, &created.Provider,
		&created.Amount, &created.Status, &created.Plan, &created.PaymentMethod,
		&created.PhoneNumber, &metadataStr, &webhookDataStr,
		&created.CreatedAt, &created.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("erreur lors de la création du paiement")
	}

	json.Unmarshal(metadataStr, &created.Metadata)
	json.Unmarshal(webhookDataStr, &created.WebhookData)

	return created, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*Payment, error) {
	query := `
		SELECT id, user_id, transaction_id, provider, amount, status, plan, payment_method, phone_number, metadata, webhook_data, created_at, updated_at
		FROM payments WHERE id = $1
	`

	p := &Payment{}
	var metadataStr, webhookDataStr []byte

	err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID, &p.UserID, &p.TransactionID, &p.Provider,
		&p.Amount, &p.Status, &p.Plan, &p.PaymentMethod,
		&p.PhoneNumber, &metadataStr, &webhookDataStr,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("paiement introuvable")
	}

	json.Unmarshal(metadataStr, &p.Metadata)
	json.Unmarshal(webhookDataStr, &p.WebhookData)

	return p, nil
}

func (r *Repository) FindByTransactionID(ctx context.Context, txID string) (*Payment, error) {
	query := `
		SELECT id, user_id, transaction_id, provider, amount, status, plan, payment_method, phone_number, metadata, webhook_data, created_at, updated_at
		FROM payments WHERE transaction_id = $1
	`

	p := &Payment{}
	var metadataStr, webhookDataStr []byte

	err := r.db.QueryRow(ctx, query, txID).Scan(
		&p.ID, &p.UserID, &p.TransactionID, &p.Provider,
		&p.Amount, &p.Status, &p.Plan, &p.PaymentMethod,
		&p.PhoneNumber, &metadataStr, &webhookDataStr,
		&p.CreatedAt, &p.UpdatedAt,
	)

	if err != nil {
		return nil, errors.New("paiement introuvable")
	}

	json.Unmarshal(metadataStr, &p.Metadata)
	json.Unmarshal(webhookDataStr, &p.WebhookData)

	return p, nil
}

func (r *Repository) UpdateStatus(ctx context.Context, id string, status PaymentStatus, webhookData map[string]interface{}) error {
	webhookDataJSON, _ := json.Marshal(webhookData)

	query := `
		UPDATE payments
		SET status = $1, webhook_data = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err := r.db.Exec(ctx, query, status, webhookDataJSON, id)
	return err
}

func (r *Repository) ListByUserID(ctx context.Context, userID string) ([]*Payment, error) {
	query := `
		SELECT id, user_id, transaction_id, provider, amount, status, plan, payment_method, phone_number, metadata, created_at, updated_at
		FROM payments
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, errors.New("erreur lors de la récupération des paiements")
	}
	defer rows.Close()

	payments := []*Payment{}
	for rows.Next() {
		p := &Payment{}
		var metadataStr []byte

		err := rows.Scan(
			&p.ID, &p.UserID, &p.TransactionID, &p.Provider,
			&p.Amount, &p.Status, &p.Plan, &p.PaymentMethod,
			&p.PhoneNumber, &metadataStr, &p.CreatedAt, &p.UpdatedAt,
		)

		if err != nil {
			continue
		}

		json.Unmarshal(metadataStr, &p.Metadata)
		payments = append(payments, p)
	}

	return payments, nil
}
