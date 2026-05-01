package main

import (
	"bufio"
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
	"syscall"

	"github.com/openspace/backend/internal/user"
	"github.com/openspace/backend/pkg/config"
	"github.com/openspace/backend/pkg/database"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"
)

func main() {
	// Flags en ligne de commande
	email := flag.String("email", "", "Email du nouvel administrateur")
	firstName := flag.String("first_name", "", "Prénom")
	lastName := flag.String("last_name", "", "Nom")
	flag.Parse()

	// Charger la configuration
	cfg := config.Load()

	// Connexion à la base de données
	db := database.Connect(&cfg.Database)
	defer database.Close()

	// Créer le repository
	userRepo := user.NewRepository(db)

	// Collecter les informations interactivement si non fourni via flags
	if *email == "" {
		*email = promptString("Email: ")
	}
	if *firstName == "" {
		*firstName = promptString("Prénom: ")
	}
	if *lastName == "" {
		*lastName = promptString("Nom: ")
	}

	// Demander le mot de passe (caché)
	password := promptPassword()

	// Confirmation
	fmt.Printf("\nCréation d'un administrateur:\n")
	fmt.Printf("  Email: %s\n", *email)
	fmt.Printf("  Prénom: %s\n", *firstName)
	fmt.Printf("  Nom: %s\n", *lastName)
	fmt.Print("Confirmer (o/n)? ")

	reader := bufio.NewReader(os.Stdin)
	confirm, _ := reader.ReadString('\n')
	if strings.TrimSpace(confirm) != "o" && strings.TrimSpace(confirm) != "y" {
		fmt.Println("Opération annulée")
		return
	}

	// Hasher le mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		log.Fatalf("Erreur lors du hachage du mot de passe: %v", err)
	}

	// Créer l'utilisateur administrateur
	newUser := &user.User{
		Email:      *email,
		Password:   string(hashedPassword),
		FirstName:  *firstName,
		LastName:   *lastName,
		IsVerified: true,
		IsAdmin:    true,
	}

	ctx := context.Background()
	created, err := userRepo.Create(ctx, newUser)
	if err != nil {
		log.Fatalf("Erreur lors de la création de l'administrateur: %v", err)
	}

	fmt.Printf("\n✅ Administrateur créé avec succès!\n")
	fmt.Printf("  ID: %s\n", created.ID)
	fmt.Printf("  Email: %s\n", created.Email)
	fmt.Printf("  Admin: %v\n", created.IsAdmin)
}

// promptString demande une chaîne de caractères à l'utilisateur
func promptString(prompt string) string {
	fmt.Print(prompt)
	reader := bufio.NewReader(os.Stdin)
	text, _ := reader.ReadString('\n')
	return strings.TrimSpace(text)
}

// promptPassword demande un mot de passe masqué à l'utilisateur
func promptPassword() string {
	fmt.Print("Mot de passe: ")
	passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
	if err != nil {
		log.Fatalf("Erreur lors de la lecture du mot de passe: %v", err)
	}
	fmt.Println()

	fmt.Print("Confirmer le mot de passe: ")
	confirmBytes, err := term.ReadPassword(int(syscall.Stdin))
	if err != nil {
		log.Fatalf("Erreur lors de la confirmation du mot de passe: %v", err)
	}
	fmt.Println()

	if string(passwordBytes) != string(confirmBytes) {
		log.Fatalf("Les mots de passe ne correspondent pas")
	}

	return string(passwordBytes)
}
