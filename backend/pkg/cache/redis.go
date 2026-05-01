package cache

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
	"github.com/openspace/backend/pkg/config"
)

var Client *redis.Client

func Connect(cfg *config.RedisConfig) *redis.Client {
	Client = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	if _, err := Client.Ping(context.Background()).Result(); err != nil {
		log.Fatalf("Unable to connect to Redis: %v\n", err)
	}

	log.Println("✅ Redis connected")
	return Client
}

func Close() {
	if Client != nil {
		Client.Close()
		log.Println("Redis connection closed")
	}
}
