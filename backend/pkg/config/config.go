package config

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	App      AppConfig
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
	Payment  PaymentConfig
	Domain   DomainConfig
}

type AppConfig struct {
	Port string
	Env  string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	AccessSecret  string
	RefreshSecret string
	AccessExpiry  int // minutes
	RefreshExpiry int // hours
}

type PaymentConfig struct {
	CinetPayAPIKey    string
	CinetPaySiteID    string
	CinetPaySecretKey string
	CinetPayBaseURL   string
	NotchPayPublicKey string
	NotchPaySecretKey string
	NotchPayBaseURL   string
	WebhookBaseURL    string
}

type DomainConfig struct {
	OpenProviderUsername string
	OpenProviderPassword string
	OpenProviderAPIURL   string
	DefaultNameservers   []string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", "0"))
	accessExpiry, _ := strconv.Atoi(getEnv("JWT_ACCESS_EXPIRY", "15"))
	refreshExpiry, _ := strconv.Atoi(getEnv("JWT_REFRESH_EXPIRY", "168"))

	return &Config{
		App: AppConfig{
			Port: getEnv("APP_PORT", "8000"),
			Env:  getEnv("APP_ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "otaku_krew_user_db"),
			Password: getEnv("DB_PASSWORD", "otaku_krew_passwords_db"),
			Name:     getEnv("DB_NAME", "openspace"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
		JWT: JWTConfig{
			AccessSecret:  getEnv("JWT_ACCESS_SECRET", "change-me-in-production"),
			RefreshSecret: getEnv("JWT_REFRESH_SECRET", "change-me-in-production-refresh"),
			AccessExpiry:  accessExpiry,
			RefreshExpiry: refreshExpiry,
		},
		Payment: PaymentConfig{
			CinetPayAPIKey:    getEnv("CINETPAY_API_KEY", ""),
			CinetPaySiteID:    getEnv("CINETPAY_SITE_ID", ""),
			CinetPaySecretKey: getEnv("CINETPAY_SECRET_KEY", ""),
			CinetPayBaseURL:   getEnv("CINETPAY_BASE_URL", "https://api-checkout.cinetpay.com"),
			NotchPayPublicKey: getEnv("NOTCHPAY_PUBLIC_KEY", ""),
			NotchPaySecretKey: getEnv("NOTCHPAY_SECRET_KEY", ""),
			NotchPayBaseURL:   getEnv("NOTCHPAY_BASE_URL", "https://api.notchpay.co"),
			WebhookBaseURL:    getEnv("WEBHOOK_BASE_URL", "http://localhost:8080"),
		},
		Domain: DomainConfig{
			OpenProviderUsername: getEnv("OPENPROVIDER_USERNAME", ""),
			OpenProviderPassword: getEnv("OPENPROVIDER_PASSWORD", ""),
			OpenProviderAPIURL:   getEnv("OPENPROVIDER_API_URL", "https://api.openprovider.eu/v1beta"),
			DefaultNameservers:   strings.Split(getEnv("OPENPROVIDER_NAMESERVERS", "ns1.openspace.cm,ns2.openspace.cm"), ","),
		},
	}
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
