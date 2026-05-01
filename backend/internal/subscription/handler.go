package subscription

import (
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
	}
}

func (h *Handler) GetMySubscription(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	subscription, err := h.service.GetActiveByUserID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Aucun abonnement actif trouvé",
		})
	}

	response := SubscriptionResponse{
		ID:        subscription.ID,
		Plan:      subscription.Plan,
		Status:    subscription.Status,
		StartedAt: subscription.StartedAt,
		ExpiresAt: subscription.ExpiresAt,
		Container: subscription.Container,
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

func (h *Handler) CancelSubscription(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	err := h.service.Cancel(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Abonnement annulé avec succès",
	})
}

func (h *Handler) GetSubscriptionStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	subscription, err := h.service.GetActiveByUserID(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"has_subscription": false,
			},
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"has_subscription": true,
			"status":           subscription.Status,
			"plan":             subscription.Plan,
			"expires_at":       subscription.ExpiresAt,
		},
	})
}

func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	router.Get("/subscriptions/me", jwtMiddleware, handler.GetMySubscription)
	router.Post("/subscriptions/cancel", jwtMiddleware, handler.CancelSubscription)
	router.Get("/subscriptions/me/status", jwtMiddleware, handler.GetSubscriptionStatus)
}
