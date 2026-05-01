package domain

import "time"

type DomainStatus string

const (
	StatusPending     DomainStatus = "pending"
	StatusActive      DomainStatus = "active"
	StatusExpired     DomainStatus = "expired"
	StatusTransferred DomainStatus = "transferred"
	StatusDeleted     DomainStatus = "deleted"
)

type Domain struct {
	ID            string       `json:"id"`
	UserID        string       `json:"user_id"`
	ContainerID   *string      `json:"container_id,omitempty"`
	DomainName    string       `json:"domain_name"`
	ProviderID    string       `json:"provider_id"`
	Status        DomainStatus `json:"status"`
	Registrar     string       `json:"registrar"`
	RegisteredAt  *time.Time   `json:"registered_at,omitempty"`
	ExpiresAt     *time.Time   `json:"expires_at,omitempty"`
	AutoRenew     bool         `json:"auto_renew"`
	DNSConfigured bool         `json:"dns_configured"`
	Nameservers   []string     `json:"nameservers"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
}

type SearchDomainRequest struct {
	DomainName string `json:"domain_name" validate:"required"`
}

type SearchDomainResponse struct {
	DomainName string `json:"domain_name"`
	Available  bool   `json:"available"`
	Price      int    `json:"price"`
	Currency   string `json:"currency"`
}

type PurchaseDomainRequest struct {
	DomainName  string  `json:"domain_name" validate:"required"`
	ContainerID *string `json:"container_id"` // Optionnel
}

type ConfigureDNSRequest struct {
	ContainerID string `json:"container_id" validate:"required"`
}

type DomainResponse struct {
	ID            string       `json:"id"`
	DomainName    string       `json:"domain_name"`
	Status        DomainStatus `json:"status"`
	RegisteredAt  *time.Time   `json:"registered_at,omitempty"`
	ExpiresAt     *time.Time   `json:"expires_at,omitempty"`
	DNSConfigured bool         `json:"dns_configured"`
	Nameservers   []string     `json:"nameservers"`
	CreatedAt     time.Time    `json:"created_at"`
}
