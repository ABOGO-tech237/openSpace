package user

import "time"

type User struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	Password   string    `json:"-"` // Jamais exposé en JSON
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	IsVerified bool      `json:"is_verified"`
	IsAdmin    bool      `json:"is_admin"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required,min=2"`
	LastName  string `json:"last_name" validate:"required,min=2"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UserResponse struct {
	ID         string    `json:"id"`
	Email      string    `json:"email"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	IsVerified bool      `json:"is_verified"`
	IsAdmin    bool      `json:"is_admin"`
	CreatedAt  time.Time `json:"created_at"`
}
