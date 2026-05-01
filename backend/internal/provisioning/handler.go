package provisioning

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Create(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	req := new(ProvisionRequest)
	if err := c.BodyParser(req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}

	req.UserID = userID

	container, err := h.service.Provision(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Votre espace est en cours de création — prêt dans quelques secondes",
		"data": fiber.Map{
			"container": container,
			"url":       container.Hostname + ".openspace.cm",
		},
	})
}

func (h *Handler) GetMine(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	container, err := h.service.GetByUserID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Aucun espace trouvé",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"container": container,
			"url":       container.Hostname + ".openspace.cm",
		},
	})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	if err := h.service.Deprovision(c.Context(), userID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Votre espace a été supprimé",
	})
}

// RegisterRoutes enregistre les routes provisioning
func RegisterRoutes(router fiber.Router, handler *Handler) {
	spaces := router.Group("/spaces")
	spaces.Post("/", handler.Create)
	spaces.Get("/me", handler.GetMine)
	spaces.Delete("/me", handler.Delete)
}
