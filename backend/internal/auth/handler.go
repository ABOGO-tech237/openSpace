package auth

import (
	"context"
	"errors"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/openspace/backend/pkg/config"
	"golang.org/x/crypto/bcrypt"
)

// UserRepository définit les méthodes nécessaires pour le repository utilisateur
type UserRepository interface {
	Create(ctx context.Context, u *User) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	FindByID(ctx context.Context, id string) (*User, error)
	EmailExists(ctx context.Context, email string) bool
}

// User représente un utilisateur (copie locale pour éviter import cyclique)
type User struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	Password   string `json:"-"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	IsVerified bool   `json:"is_verified"`
	IsAdmin    bool   `json:"is_admin"`
}

// Service gère l'authentification
type Service struct {
	userRepo UserRepository
	cfg      *config.JWTConfig
}

// NewService crée un nouveau service d'authentification
func NewService(userRepo UserRepository, cfg *config.JWTConfig) *Service {
	return &Service{
		userRepo: userRepo,
		cfg:      cfg,
	}
}

// Register crée un nouveau compte utilisateur
func (s *Service) Register(ctx context.Context, req *RegisterRequest) (*UserResponse, *TokenPair, error) {
	// Vérifier si l'email existe déjà
	if s.userRepo.EmailExists(ctx, req.Email) {
		return nil, nil, errors.New("cet email est déjà utilisé")
	}

	// Hasher le mot de passe avec bcrypt (coût 12)
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
	if err != nil {
		return nil, nil, errors.New("erreur lors du traitement du mot de passe")
	}

	// Créer l'utilisateur
	newUser := &User{
		Email:     req.Email,
		Password:  string(hashedPassword),
		FirstName: req.FirstName,
		LastName:  req.LastName,
	}

	created, err := s.userRepo.Create(ctx, newUser)
	if err != nil {
		return nil, nil, errors.New("erreur lors de la création du compte")
	}

	// Générer les tokens
	tokens, err := GenerateTokenPair(created.ID, created.Email, created.IsAdmin, s.cfg)
	if err != nil {
		return nil, nil, errors.New("erreur lors de la génération des tokens")
	}

	response := &UserResponse{
		ID:         created.ID,
		Email:      created.Email,
		FirstName:  created.FirstName,
		LastName:   created.LastName,
		IsVerified: created.IsVerified,
		IsAdmin:    created.IsAdmin,
	}

	return response, tokens, nil
}

// Login authentifie un utilisateur
func (s *Service) Login(ctx context.Context, req *LoginRequest) (*UserResponse, *TokenPair, error) {
	// Trouver l'utilisateur
	found, err := s.userRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		// Message générique — ne pas révéler si l'email existe
		return nil, nil, errors.New("email ou mot de passe incorrect")
	}

	// Vérifier le mot de passe
	if err := bcrypt.CompareHashAndPassword([]byte(found.Password), []byte(req.Password)); err != nil {
		return nil, nil, errors.New("email ou mot de passe incorrect")
	}

	// Générer les tokens
	tokens, err := GenerateTokenPair(found.ID, found.Email, found.IsAdmin, s.cfg)
	if err != nil {
		return nil, nil, errors.New("erreur lors de la génération des tokens")
	}

	response := &UserResponse{
		ID:         found.ID,
		Email:      found.Email,
		FirstName:  found.FirstName,
		LastName:   found.LastName,
		IsVerified: found.IsVerified,
		IsAdmin:    found.IsAdmin,
	}

	return response, tokens, nil
}

// GetByID récupère un utilisateur par son ID
func (s *Service) GetByID(ctx context.Context, id string) (*UserResponse, error) {
	found, err := s.userRepo.FindByID(ctx, id)
	if err != nil {
		return nil, errors.New("utilisateur introuvable")
	}

	return &UserResponse{
		ID:         found.ID,
		Email:      found.Email,
		FirstName:  found.FirstName,
		LastName:   found.LastName,
		IsVerified: found.IsVerified,
		IsAdmin:    found.IsAdmin,
	}, nil
}

// Handler gère les requêtes HTTP d'authentification
type Handler struct {
	service  *Service
	validate *validator.Validate
}

// NewHandler crée un nouveau handler d'authentification
func NewHandler(service *Service) *Handler {
	return &Handler{
		service:  service,
		validate: validator.New(),
	}
}

// Register gère l'inscription d'un nouvel utilisateur
func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format de requête invalide",
		})
	}

	// Valider les champs
	if err := h.validate.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides: vérifiez email, mot de passe (min 8 caractères), prénom et nom",
		})
	}

	// Appeler le service
	user, tokens, err := h.service.Register(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Compte créé avec succès",
		"data": fiber.Map{
			"user":          user,
			"access_token":  tokens.AccessToken,
			"refresh_token": tokens.RefreshToken,
		},
	})
}

// Login gère la connexion d'un utilisateur
func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Format de requête invalide",
		})
	}

	// Valider les champs
	if err := h.validate.Struct(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Email et mot de passe requis",
		})
	}

	// Appeler le service
	user, tokens, err := h.service.Login(c.Context(), &req)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Connexion réussie",
		"data": fiber.Map{
			"user":          user,
			"access_token":  tokens.AccessToken,
			"refresh_token": tokens.RefreshToken,
		},
	})
}

// Me retourne le profil de l'utilisateur connecté
func (h *Handler) Me(c *fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(string)
	if !ok || userID == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Utilisateur non authentifié",
		})
	}

	user, err := h.service.GetByID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    user,
	})
}

// RegisterRoutes enregistre les routes d'authentification
func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	router.Post("/auth/register", handler.Register)
	router.Post("/auth/login", handler.Login)
	router.Get("/auth/me", jwtMiddleware, handler.Me)
}
