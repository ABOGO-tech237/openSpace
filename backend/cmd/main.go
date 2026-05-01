package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"sort"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/openspace/backend/internal/admin"
	"github.com/openspace/backend/internal/auth"
	"github.com/openspace/backend/internal/domain"
	"github.com/openspace/backend/internal/payment"
	"github.com/openspace/backend/internal/provisioning"
	"github.com/openspace/backend/internal/subscription"
	"github.com/openspace/backend/internal/user"
	"github.com/openspace/backend/pkg/cache"
	"github.com/openspace/backend/pkg/config"
	"github.com/openspace/backend/pkg/database"
)

// userRepoAdapter adapte user.Repository à l'interface auth.UserRepository
type userRepoAdapter struct {
	repo *user.Repository
}

func (a *userRepoAdapter) Create(ctx context.Context, u *auth.User) (*auth.User, error) {
	userModel := &user.User{
		Email:     u.Email,
		Password:  u.Password,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		IsAdmin:   u.IsAdmin,
	}
	created, err := a.repo.Create(ctx, userModel)
	if err != nil {
		return nil, err
	}
	return &auth.User{
		ID:         created.ID,
		Email:      created.Email,
		Password:   created.Password,
		FirstName:  created.FirstName,
		LastName:   created.LastName,
		IsVerified: created.IsVerified,
		IsAdmin:    created.IsAdmin,
	}, nil
}

func (a *userRepoAdapter) FindByEmail(ctx context.Context, email string) (*auth.User, error) {
	found, err := a.repo.FindByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	return &auth.User{
		ID:         found.ID,
		Email:      found.Email,
		Password:   found.Password,
		FirstName:  found.FirstName,
		LastName:   found.LastName,
		IsVerified: found.IsVerified,
		IsAdmin:    found.IsAdmin,
	}, nil
}

func (a *userRepoAdapter) FindByID(ctx context.Context, id string) (*auth.User, error) {
	found, err := a.repo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return &auth.User{
		ID:         found.ID,
		Email:      found.Email,
		Password:   found.Password,
		FirstName:  found.FirstName,
		LastName:   found.LastName,
		IsVerified: found.IsVerified,
		IsAdmin:    found.IsAdmin,
	}, nil
}

func (a *userRepoAdapter) EmailExists(ctx context.Context, email string) bool {
	return a.repo.EmailExists(ctx, email)
}

func main() {
	// Charger la configuration
	cfg := config.Load()

	// Connexions
	db := database.Connect(&cfg.Database)
	defer database.Close()

	_ = cache.Connect(&cfg.Redis)
	defer cache.Close()

	// Initialiser les repositories
	userRepo := user.NewRepository(db)
	provisioningRepo := provisioning.NewRepository(db)
	paymentRepo := payment.NewRepository(db)
	subscriptionRepo := subscription.NewRepository(db)
	domainRepo := domain.NewRepository(db)
	adminRepo := admin.NewRepository(db)

	// Initialiser le client Docker
	dockerClient, err := provisioning.NewDockerClient()
	if err != nil {
		log.Fatalf("❌ Impossible de se connecter à Docker: %v", err)
	}

	// Initialiser les services
	userRepoAdapted := &userRepoAdapter{repo: userRepo}
	authService := auth.NewService(userRepoAdapted, &cfg.JWT)
	provisioningService := provisioning.NewService(provisioningRepo, dockerClient)
	subscriptionService := subscription.NewService(subscriptionRepo, provisioningService)
	paymentService := payment.NewService(paymentRepo, subscriptionService, &cfg.Payment)
	domainService := domain.NewService(domainRepo, subscriptionService, provisioningRepo, &cfg.Domain)
	adminService := admin.NewService(adminRepo)

	// Initialiser les handlers
	authHandler := auth.NewHandler(authService)
	provisioningHandler := provisioning.NewHandler(provisioningService)
	paymentHandler := payment.NewHandler(paymentService)
	subscriptionHandler := subscription.NewHandler(subscriptionService)
	domainHandler := domain.NewHandler(domainService)
	adminHandler := admin.NewHandler(adminService)

	// Middleware JWT
	jwtMiddleware := auth.Middleware(&cfg.JWT)

	// Initialiser Fiber
	app := fiber.New(fiber.Config{
		AppName:      "OpenSpace API v1.0",
		ErrorHandler: customErrorHandler,
	})

	// Middlewares globaux
	app.Use(recover.New()) // Récupère les panics
	app.Use(helmet.New())  // Headers de sécurité
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} ${latency}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://openspace.com, http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE",
	}))
	app.Use(limiter.New(limiter.Config{
		Max:        100, // 100 requêtes
		Expiration: time.Minute,
	}))

	// Routes de santé
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"name":    "OpenSpace API",
			"version": "1.0.0",
			"status":  "running",
		})
	})

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "ok",
			"database": "connected",
			"cache":    "connected",
		})
	})

	// Groupe API v1
	v1 := app.Group("/api/v1")
	v1.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "ok",
			"database": "connected",
			"cache":    "connected",
		})
	})

	// Enregistrer les routes auth
	auth.RegisterRoutes(v1, authHandler, jwtMiddleware)

	// Plans publics
	v1.Get("/plans", func(c *fiber.Ctx) error {
		type planResponse struct {
			Name    string  `json:"name"`
			RAM     string  `json:"ram"`
			CPUs    float64 `json:"cpus"`
			Storage int     `json:"storage"`
			Price   int     `json:"price"`
		}

		keys := make([]string, 0, len(provisioning.Plans))
		for plan := range provisioning.Plans {
			keys = append(keys, string(plan))
		}
		sort.Strings(keys)

		plans := make([]planResponse, 0, len(keys))
		for _, key := range keys {
			cfg := provisioning.Plans[provisioning.Plan(key)]
			plans = append(plans, planResponse{
				Name:    key,
				RAM:     cfg.RAM,
				CPUs:    cfg.CPUs,
				Storage: cfg.Storage,
				Price:   cfg.Price,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"data":    plans,
		})
	})

	// Routes provisioning (avec middleware JWT sur le groupe /spaces)
	spacesGroup := v1.Group("/spaces", jwtMiddleware)
	spacesGroup.Post("/", provisioningHandler.Create)
	spacesGroup.Get("/me", provisioningHandler.GetMine)
	spacesGroup.Delete("/me", provisioningHandler.Delete)

	// Routes payment et webhooks
	payment.RegisterRoutes(v1, paymentHandler, jwtMiddleware)

	// Routes subscription
	subscription.RegisterRoutes(v1, subscriptionHandler, jwtMiddleware)

	// Routes domain
	domain.RegisterRoutes(v1, domainHandler, jwtMiddleware)

	// Routes admin
	admin.RegisterRoutes(v1, adminHandler, jwtMiddleware)

	// Démarrage gracieux
	go func() {
		log.Printf("🚀 OpenSpace API démarré sur le port %s", cfg.App.Port)
		if err := app.Listen(":" + cfg.App.Port); err != nil {
			log.Fatalf("Erreur démarrage serveur: %v", err)
		}
	}()

	// Arrêt gracieux
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Arrêt du serveur...")
	if err := app.Shutdown(); err != nil {
		log.Fatalf("Erreur arrêt serveur: %v", err)
	}
	log.Println("✅ Serveur arrêté proprement")
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Erreur interne du serveur"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"success": false,
		"error":   message,
	})
}
