package user

import (
	"context"
	"errors"

	"github.com/openspace/backend/internal/auth"
	"github.com/openspace/backend/pkg/config"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	userRepo *Repository
	cfg      *config.JWTConfig
}

func NewService(userRepo *Repository, cfg *config.JWTConfig) *Service {
	return &Service{userRepo: userRepo, cfg: cfg}
}

func (s *Service) Register(ctx context.Context, req *RegisterRequest) (*UserResponse, *auth.TokenPair, error) {
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
	tokens, err := auth.GenerateTokenPair(created.ID, created.Email, false, s.cfg)
	if err != nil {
		return nil, nil, errors.New("erreur lors de la génération des tokens")
	}

	response := &UserResponse{
		ID:         created.ID,
		Email:      created.Email,
		FirstName:  created.FirstName,
		LastName:   created.LastName,
		IsVerified: created.IsVerified,
		CreatedAt:  created.CreatedAt,
	}

	return response, tokens, nil
}

func (s *Service) Login(ctx context.Context, req *LoginRequest) (*UserResponse, *auth.TokenPair, error) {
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
	tokens, err := auth.GenerateTokenPair(found.ID, found.Email, found.IsAdmin, s.cfg)
	if err != nil {
		return nil, nil, errors.New("erreur lors de la génération des tokens")
	}

	response := &UserResponse{
		ID:         found.ID,
		Email:      found.Email,
		FirstName:  found.FirstName,
		LastName:   found.LastName,
		IsVerified: found.IsVerified,
		CreatedAt:  found.CreatedAt,
	}

	return response, tokens, nil
}
