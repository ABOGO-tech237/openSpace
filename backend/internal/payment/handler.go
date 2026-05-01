package payment

import (
	"encoding/json"
	"log"

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

func (h *Handler) InitiatePayment(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req InitiatePaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}

	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"error":   "Veuillez vérifier les données fournies",
		})
	}

	resp, err := h.service.InitiatePayment(c.Context(), userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"message": "Paiement initié avec succès",
		"data":    resp,
	})
}

func (h *Handler) CinetPayWebhook(c *fiber.Ctx) error {
	// Parser le corps de la requête
	var payload map[string]interface{}
	if err := c.BodyParser(&payload); err != nil {
		log.Printf("❌ Erreur parsing webhook CinetPay: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid payload",
		})
	}

	log.Printf("🔔 Webhook CinetPay reçu: %v", payload)

	// Traiter le webhook
	if err := h.service.ProcessCinetPayWebhook(c.Context(), payload); err != nil {
		log.Printf("❌ Erreur traitement webhook CinetPay: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Webhook processing failed",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
	})
}

func (h *Handler) NotchPayWebhook(c *fiber.Ctx) error {
	// Récupérer la signature du header
	signature := c.Get("X-Notch-Signature")
	if signature == "" {
		log.Printf("❌ Webhook NotchPay sans signature")
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Missing signature",
		})
	}

	// Lire le corps brut une seule fois: il sert à la vérification de signature et au parsing JSON.
	rawBody := c.Body()

	// Parser le JSON depuis le payload brut
	var payload map[string]interface{}
	if err := json.Unmarshal(rawBody, &payload); err != nil {
		log.Printf("❌ Erreur parsing webhook NotchPay: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Invalid payload",
		})
	}

	log.Printf("🔔 Webhook NotchPay reçu: %v", payload)

	// Traiter le webhook
	if err := h.service.ProcessNotchPayWebhook(c.Context(), payload, signature, string(rawBody)); err != nil {
		log.Printf("❌ Erreur traitement webhook NotchPay: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"error":   "Webhook processing failed",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
	})
}

func (h *Handler) GetPaymentStatus(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	transactionID := c.Params("transactionID")

	payment, err := h.service.GetUserPaymentByTransactionID(c.Context(), userID, transactionID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Paiement introuvable",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    payment,
	})
}

func (h *Handler) GetMyPayments(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	payments, err := h.service.GetUserPayments(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la récupération des paiements",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"success": true,
		"data":    payments,
	})
}

func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	// Routes protégées
	router.Post("/payments/initiate", jwtMiddleware, handler.InitiatePayment)
	router.Get("/payments/me", jwtMiddleware, handler.GetMyPayments)
	router.Get("/payments/:transactionID", jwtMiddleware, handler.GetPaymentStatus)

	// Webhooks publics (pas de JWT)
	router.Post("/webhooks/cinetpay", handler.CinetPayWebhook)
	router.Post("/webhooks/notchpay", handler.NotchPayWebhook)
}
