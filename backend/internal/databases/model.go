package databases

import "time"

type Engine string

const (
	EngineMySQL      Engine = "mysql"
	EnginePostgreSQL Engine = "postgresql"
	EngineMongoDB    Engine = "mongodb"
	EngineRedis      Engine = "redis"
)

type InstanceStatus string

const (
	StatusCreating InstanceStatus = "creating"
	StatusActive   InstanceStatus = "active"
	StatusError    InstanceStatus = "error"
	StatusDeleting InstanceStatus = "deleting"
	StatusDeleted  InstanceStatus = "deleted"
)

type Instance struct {
	ID             string         `json:"id"`
	UserID         string         `json:"user_id"`
	ContainerID    *string        `json:"container_id,omitempty"`
	Name           string         `json:"name"`
	Engine         Engine         `json:"engine"`
	Version        string         `json:"version"`
	Status         InstanceStatus `json:"status"`
	Host           string         `json:"host"`
	Port           int            `json:"port"`
	DatabaseName   string         `json:"database_name"`
	Username       string         `json:"username,omitempty"`
	StorageMB      int            `json:"storage_mb"`
	MaxConnections int            `json:"max_connections"`
	DockerID       string         `json:"-"`
	NetworkName    string         `json:"-"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
}

type InstanceWithCredentials struct {
	Instance
	Password         string `json:"password,omitempty"`
	ConnectionString string `json:"connection_string,omitempty"`
}

type DBUser struct {
	ID          string    `json:"id"`
	InstanceID  string    `json:"instance_id"`
	Username    string    `json:"username"`
	Permissions []string  `json:"permissions"`
	CreatedAt   time.Time `json:"created_at"`
}

type Backup struct {
	ID          string    `json:"id"`
	InstanceID  string    `json:"instance_id"`
	SizeBytes   int64     `json:"size_bytes"`
	StoragePath string    `json:"storage_path,omitempty"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type CreateRequest struct {
	Name   string `json:"name" validate:"required,min=3,max=32"`
	Engine Engine `json:"engine" validate:"required,oneof=mysql postgresql mongodb redis"`
}

type CreateUserRequest struct {
	Username    string   `json:"username" validate:"required,min=3,max=32"`
	Permissions []string `json:"permissions"`
}

type PlanQuota struct {
	MaxSQL       int
	MaxNoSQL     int
	MaxStorageMB int
}

var PlanQuotas = map[string]PlanQuota{
	"starter":  {MaxSQL: 1, MaxNoSQL: 0, MaxStorageMB: 500},
	"dev":      {MaxSQL: 2, MaxNoSQL: 1, MaxStorageMB: 1024},
	"pro":      {MaxSQL: 5, MaxNoSQL: 2, MaxStorageMB: 2048},
	"business": {MaxSQL: 100, MaxNoSQL: 100, MaxStorageMB: 5120},
}

var engineConfig = map[Engine]struct {
	Image   string
	Port    int
	Version string
	IsNoSQL bool
}{
	EngineMySQL:      {Image: "mysql:8", Port: 3306, Version: "8", IsNoSQL: false},
	EnginePostgreSQL: {Image: "postgres:16-alpine", Port: 5432, Version: "16", IsNoSQL: false},
	EngineMongoDB:    {Image: "mongo:7", Port: 27017, Version: "7", IsNoSQL: true},
	EngineRedis:      {Image: "redis:7-alpine", Port: 6379, Version: "7", IsNoSQL: true},
}

func IsNoSQLEngine(engine Engine) bool {
	cfg, ok := engineConfig[engine]
	return ok && cfg.IsNoSQL
}

func IsSQLEngine(engine Engine) bool {
	cfg, ok := engineConfig[engine]
	return ok && !cfg.IsNoSQL
}
