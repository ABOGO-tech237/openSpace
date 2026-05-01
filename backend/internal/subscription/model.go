package subscription

import "time"

type SubscriptionStatus string

const (
	StatusActive    SubscriptionStatus = "active"
	StatusExpired   SubscriptionStatus = "expired"
	StatusCancelled SubscriptionStatus = "cancelled"
	StatusSuspended SubscriptionStatus = "suspended"
)

type Subscription struct {
	ID          string             `json:"id"`
	UserID      string             `json:"user_id"`
	ContainerID *string            `json:"container_id,omitempty"`
	PaymentID   string             `json:"payment_id"`
	Plan        string             `json:"plan"`
	Status      SubscriptionStatus `json:"status"`
	StartedAt   time.Time          `json:"started_at"`
	ExpiresAt   time.Time          `json:"expires_at"`
	AutoRenew   bool               `json:"auto_renew"`
	CancelledAt *time.Time         `json:"cancelled_at,omitempty"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
}

type SubscriptionWithContainer struct {
	ID          string             `json:"id"`
	UserID      string             `json:"user_id"`
	PaymentID   string             `json:"payment_id"`
	Plan        string             `json:"plan"`
	Status      SubscriptionStatus `json:"status"`
	StartedAt   time.Time          `json:"started_at"`
	ExpiresAt   time.Time          `json:"expires_at"`
	AutoRenew   bool               `json:"auto_renew"`
	CreatedAt   time.Time          `json:"created_at"`
	UpdatedAt   time.Time          `json:"updated_at"`
	// Container info
	Container *ContainerInfo `json:"container,omitempty"`
}

type ContainerInfo struct {
	ID         string `json:"id"`
	Hostname   string `json:"hostname"`
	Status     string `json:"status"`
	InternalIP string `json:"internal_ip,omitempty"`
}

type CreateSubscriptionRequest struct {
	UserID    string `json:"user_id" validate:"required"`
	PaymentID string `json:"payment_id" validate:"required"`
	Plan      string `json:"plan" validate:"required"`
	Hostname  string `json:"hostname" validate:"required,min=3,max=30"`
}

type SubscriptionResponse struct {
	ID        string             `json:"id"`
	Plan      string             `json:"plan"`
	Status    SubscriptionStatus `json:"status"`
	StartedAt time.Time          `json:"started_at"`
	ExpiresAt time.Time          `json:"expires_at"`
	Container *ContainerInfo     `json:"container,omitempty"`
}
