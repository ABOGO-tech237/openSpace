package domain

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service  *Service
	validate *validator.Validate
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service:  service,
		validate: validator.New(),
	}
}

func (h *Handler) SearchDomain(c *fiber.Ctx) error {
	var req SearchDomainRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"error":   "Veuillez fournir un nom de domaine valide",
		})
	}

	result, err := h.service.SearchDomain(c.Context(), req.DomainName)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

func (h *Handler) PurchaseDomain(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req PurchaseDomainRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"error":   "Veuillez fournir un nom de domaine valide",
		})
	}

	domain, err := h.service.PurchaseDomain(c.Context(), userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Domaine acheté avec succès",
		"data": DomainResponse{
			ID:            domain.ID,
			DomainName:    domain.DomainName,
			Status:        domain.Status,
			RegisteredAt:  domain.RegisteredAt,
			ExpiresAt:     domain.ExpiresAt,
			DNSConfigured: domain.DNSConfigured,
			Nameservers:   domain.Nameservers,
			CreatedAt:     domain.CreatedAt,
		},
	})
}

func (h *Handler) GetMyDomains(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	domains, err := h.service.ListUserDomains(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la récupération des domaines",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    domains,
	})
}

func (h *Handler) ConfigureDomain(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	domainID := c.Params("id")

	var req ConfigureDNSRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"error":   "Veuillez fournir un ID de container valide",
		})
	}

	// Vérifier que le domaine appartient à l'utilisateur
	domain, err := h.service.repo.FindByID(c.Context(), domainID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Domaine introuvable",
		})
	}

	if domain.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Accès refusé",
		})
	}

	err = h.service.ConfigureDNSForContainer(c.Context(), domainID, req.ContainerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "DNS configuré avec succès",
	})
}

func (h *Handler) RenewDomain(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	domainID := c.Params("id")

	err := h.service.RenewDomain(c.Context(), userID, domainID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Domaine renouvelé avec succès",
	})
}

func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	router.Post("/domains/search", jwtMiddleware, handler.SearchDomain)
	router.Post("/domains/purchase", jwtMiddleware, handler.PurchaseDomain)
	router.Get("/domains/me", jwtMiddleware, handler.GetMyDomains)
	router.Put("/domains/:id/configure", jwtMiddleware, handler.ConfigureDomain)
	router.Post("/domains/:id/renew", jwtMiddleware, handler.RenewDomain)
}
