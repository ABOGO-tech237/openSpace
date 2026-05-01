package admin

import (
	"github.com/gofiber/fiber/v2"
)

type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// GetAllContainers retourne tous les containers (admin only)
func (h *Handler) GetAllContainers(c *fiber.Ctx) error {
	// Vérifier que l'utilisateur est admin
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Admin access required",
		})
	}

	containers, err := h.service.repo.GetAllContainers(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la récupération des containers",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    containers,
	})
}

// DeleteContainer supprime un container (admin only)
func (h *Handler) DeleteContainer(c *fiber.Ctx) error {
	// Vérifier que l'utilisateur est admin
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Admin access required",
		})
	}

	containerID := c.Params("id")
	if containerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID du container requis",
		})
	}

	// Récupérer le container pour avoir le Docker ID
	container, err := h.service.repo.GetContainerByID(c.Context(), containerID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Container introuvable",
		})
	}

	// TODO: Appeler Docker pour arrêter le container
	// dockerClient.StopContainer(ctx, container.DockerID)
	// dockerClient.RemoveContainer(ctx, container.DockerID)

	// Supprimer de la base
	if err := h.service.repo.DeleteContainer(c.Context(), containerID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la suppression",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Container supprimé",
		"data": fiber.Map{
			"hostname": container.Hostname,
		},
	})
}

// RestartContainer redémarre un container (admin only)
func (h *Handler) RestartContainer(c *fiber.Ctx) error {
	// Vérifier que l'utilisateur est admin
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Admin access required",
		})
	}

	containerID := c.Params("id")
	if containerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID du container requis",
		})
	}

	container, err := h.service.repo.GetContainerByID(c.Context(), containerID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Container introuvable",
		})
	}

	// TODO: Appeler Docker pour redémarrer
	// dockerClient.RestartContainer(ctx, container.DockerID)

	// Mettre à jour le statut
	if err := h.service.repo.UpdateContainerStatus(c.Context(), containerID, "running"); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors du redémarrage",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Container redémarré",
		"data": fiber.Map{
			"hostname": container.Hostname,
			"status":   "running",
		},
	})
}

// GetContainerTerminal retourne les infos de connexion SSH (admin only)
func (h *Handler) GetContainerTerminal(c *fiber.Ctx) error {
	// Vérifier que l'utilisateur est admin
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Admin access required",
		})
	}

	containerID := c.Params("id")
	if containerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID du container requis",
		})
	}

	container, err := h.service.repo.GetContainerByID(c.Context(), containerID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Container introuvable",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"hostname": container.Hostname,
			"ip":       container.InternalIP,
			"port":     22,
			"ssh_url":  "ssh://" + container.Hostname + "@openspace.cm",
		},
	})
}

// GetContainerStats retourne les stats du container (admin only)
func (h *Handler) GetContainerStats(c *fiber.Ctx) error {
	// Vérifier que l'utilisateur est admin
	isAdmin, ok := c.Locals("is_admin").(bool)
	if !ok || !isAdmin {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"error":   "Admin access required",
		})
	}

	containerID := c.Params("id")
	if containerID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "ID du container requis",
		})
	}

	container, err := h.service.repo.GetContainerByID(c.Context(), containerID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"error":   "Container introuvable",
		})
	}

	stats, err := h.service.repo.GetContainerStats(c.Context(), containerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Erreur lors de la récupération des stats",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"hostname": container.Hostname,
			"stats":    stats,
		},
	})
}

// RegisterRoutes enregistre les routes admin
func RegisterRoutes(router fiber.Router, handler *Handler, jwtMiddleware fiber.Handler) {
	admin := router.Group("/admin", jwtMiddleware)

	admin.Get("/containers", handler.GetAllContainers)
	admin.Delete("/containers/:id", handler.DeleteContainer)
	admin.Post("/containers/:id/restart", handler.RestartContainer)
	admin.Get("/containers/:id/terminal", handler.GetContainerTerminal)
	admin.Get("/containers/:id/stats", handler.GetContainerStats)
}
