package payment

import "time"

type Provider string

const (
	ProviderCinetPay Provider = "cinetpay"
	ProviderNotchPay Provider = "notchpay"
)

type PaymentStatus string

const (
	StatusPending   PaymentStatus = "pending"
	StatusCompleted PaymentStatus = "completed"
	StatusFailed    PaymentStatus = "failed"
	StatusRefunded  PaymentStatus = "refunded"
)

type Payment struct {
	ID            string                 `json:"id"`
	UserID        string                 `json:"user_id"`
	TransactionID string                 `json:"transaction_id"`
	Provider      Provider               `json:"provider"`
	Amount        int                    `json:"amount"`
	Status        PaymentStatus          `json:"status"`
	Plan          string                 `json:"plan"`
	PaymentMethod string                 `json:"payment_method,omitempty"`
	PhoneNumber   string                 `json:"phone_number,omitempty"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
	WebhookData   map[string]interface{} `json:"-"` // Jamais exposé
	CreatedAt     time.Time              `json:"created_at"`
	UpdatedAt     time.Time              `json:"updated_at"`
}

type InitiatePaymentRequest struct {
	Plan        string   `json:"plan" validate:"required,oneof=starter dev pro business"`
	Provider    Provider `json:"provider" validate:"required,oneof=cinetpay notchpay"`
	PhoneNumber string   `json:"phone_number" validate:"required"`
	Hostname    string   `json:"hostname" validate:"required,min=3,max=30"`
	ReturnURL   string   `json:"return_url"` // Optionnel
}

type InitiatePaymentResponse struct {
	PaymentID     string `json:"payment_id"`
	PaymentURL    string `json:"payment_url"`
	TransactionID string `json:"transaction_id"`
	Amount        int    `json:"amount"`
	ExpiresAt     int64  `json:"expires_at"` // Unix timestamp
}

type PaymentResponse struct {
	ID            string        `json:"id"`
	TransactionID string        `json:"transaction_id"`
	Provider      Provider      `json:"provider"`
	Amount        int           `json:"amount"`
	Status        PaymentStatus `json:"status"`
	Plan          string        `json:"plan"`
	CreatedAt     time.Time     `json:"created_at"`
}

type WebhookPayload struct {
	TransactionID string                 `json:"transaction_id"`
	Status        string                 `json:"status"`
	Amount        int                    `json:"amount"`
	Signature     string                 `json:"signature"`
	RawData       map[string]interface{} `json:"-"`
}
