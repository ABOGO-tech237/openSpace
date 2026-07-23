package databases

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

func (h *Handler) List(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	instances, err := h.service.List(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la récupération des bases de données",
		})
	}
	if instances == nil {
		instances = []*Instance{}
	}
	return c.JSON(fiber.Map{"success": true, "data": instances})
}

func (h *Handler) Create(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)

	var req CreateRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Données invalides",
		})
	}
	req.Engine = Engine(string(req.Engine))

	if err := h.validate.Struct(req); err != nil {
		return c.Status(fiber.StatusUnprocessableEntity).JSON(fiber.Map{
			"success": false,
			"error":   "Veuillez vérifier le nom et le type de base de données",
		})
	}

	inst, err := h.service.Create(c.Context(), userID, &req)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Votre base de données est en cours de création",
		"data":    inst,
	})
}

func (h *Handler) Get(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")

	inst, err := h.service.Get(c.Context(), userID, id)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{"success": true, "data": inst})
}

func (h *Handler) Delete(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")

	if err := h.service.Delete(c.Context(), userID, id); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Base de données supprimée",
	})
}

func (h *Handler) ListUsers(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")

	users, err := h.service.ListUsers(c.Context(), userID, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}
	if users == nil {
		users = []*DBUser{}
	}

	return c.JSON(fiber.Map{"success": true, "data": users})
}

func (h *Handler) Export(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(string)
	id := c.Params("id")

	backup, err := h.service.Export(c.Context(), userID, id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   err.Error(),
		})
	}

	return c.Status(fiber.StatusAccepted).JSON(fiber.Map{
		"success": true,
		"message": "Export planifié",
		"data":    backup,
	})
}

func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	db := router.Group("/databases", jwtMiddleware)
	db.Get("/", handler.List)
	db.Post("/", handler.Create)
	db.Get("/:id", handler.Get)
	db.Delete("/:id", handler.Delete)
	db.Get("/:id/users", handler.ListUsers)
	db.Post("/:id/export", handler.Export)
}
