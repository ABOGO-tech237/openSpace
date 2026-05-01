package auth

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/openspace/backend/pkg/config"
)

func Middleware(cfg *config.JWTConfig) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Récupérer le header Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Token manquant",
			})
		}

		// Vérifier le format "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Format de token invalide",
			})
		}

		// Valider le token
		claims, err := ValidateAccessToken(parts[1], cfg)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"error":   "Token invalide ou expiré",
			})
		}

		// Injecter les données dans le contexte
		c.Locals("user_id", claims.UserID)
		c.Locals("email", claims.Email)
		c.Locals("is_admin", claims.IsAdmin)

		return c.Next()
	}
}
