package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/openspace/backend/pkg/config"
)

var DB *pgxpool.Pool

func Connect(cfg *config.DatabaseConfig) *pgxpool.Pool {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
	)

	pool, err := pgxpool.New(context.Background(), dsn)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Unable to ping database: %v\n", err)
	}

	log.Println("✅ PostgreSQL connected")
	DB = pool
	return pool
}

func Close() {
	if DB != nil {
		DB.Close()
		log.Println("PostgreSQL connection closed")
	}
}
