package provisioning

import "time"

type Plan string

const (
	PlanStarter  Plan = "starter"
	PlanDev      Plan = "dev"
	PlanPro      Plan = "pro"
	PlanBusiness Plan = "business"
)

type PlanConfig struct {
	RAM     string  // ex: "512m"
	CPUs    float64 // ex: 0.5
	Storage int     // en Go
	Price   int     // en FCFA
}

var Plans = map[Plan]PlanConfig{
	PlanStarter:  {RAM: "512m", CPUs: 0.5, Storage: 5, Price: 2000},
	PlanDev:      {RAM: "512m", CPUs: 1.0, Storage: 10, Price: 3500},
	PlanPro:      {RAM: "1g", CPUs: 2.0, Storage: 20, Price: 6000},
	PlanBusiness: {RAM: "2g", CPUs: 4.0, Storage: 40, Price: 12000},
}

type Container struct {
	ID             string    `json:"id"`
	UserID         string    `json:"user_id"`
	DockerID       string    `json:"docker_id"`
	Hostname       string    `json:"hostname"`
	Plan           Plan      `json:"plan"`
	RAMLimit       string    `json:"ram_limit"`
	CPULimit       float64   `json:"cpu_limit"`
	StorageGB      int       `json:"storage_gb"`
	Status         string    `json:"status"` // provisioning, running, stopped, error
	InternalIP     string    `json:"internal_ip"`
	SubscriptionID *string   `json:"subscription_id,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type ProvisionRequest struct {
	UserID   string `json:"user_id"`
	Hostname string `json:"hostname"`
	Plan     Plan   `json:"plan"`
}
