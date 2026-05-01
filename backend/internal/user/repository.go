package user

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

func (r *Repository) Create(ctx context.Context, u *User) (*User, error) {
	query := `
		INSERT INTO users (email, password, first_name, last_name, is_admin)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, email, password, first_name, last_name, is_verified, is_admin, created_at, updated_at
	`
	created := &User{}
	err := r.db.QueryRow(ctx, query,
		u.Email, u.Password, u.FirstName, u.LastName, u.IsAdmin,
	).Scan(
		&created.ID, &created.Email, &created.Password,
		&created.FirstName, &created.LastName,
		&created.IsVerified, &created.IsAdmin, &created.CreatedAt, &created.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return created, nil
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (*User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, is_verified, is_admin, created_at, updated_at
		FROM users WHERE email = $1
	`
	u := &User{}
	err := r.db.QueryRow(ctx, query, email).Scan(
		&u.ID, &u.Email, &u.Password,
		&u.FirstName, &u.LastName,
		&u.IsVerified, &u.IsAdmin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("utilisateur introuvable")
	}
	return u, nil
}

func (r *Repository) FindByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT id, email, password, first_name, last_name, is_verified, is_admin, created_at, updated_at
		FROM users WHERE id = $1
	`
	u := &User{}
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.Password,
		&u.FirstName, &u.LastName,
		&u.IsVerified, &u.IsAdmin, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("utilisateur introuvable")
	}
	return u, nil
}

func (r *Repository) EmailExists(ctx context.Context, email string) bool {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
	r.db.QueryRow(ctx, query, email).Scan(&exists)
	return exists
}
