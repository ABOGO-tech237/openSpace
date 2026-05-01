package payment

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/openspace/backend/internal/provisioning"
	"github.com/openspace/backend/internal/subscription"
	"github.com/openspace/backend/pkg/config"
)

type SubscriptionService interface {
	CreateFromPayment(ctx context.Context, userID, paymentID, plan, hostname string) (*subscription.Subscription, error)
}

type Service struct {
	repo            *Repository
	cinetpay        *CinetPayClient
	notchpay        *NotchPayClient
	config          *config.PaymentConfig
	subscriptionSvc SubscriptionService
}

func NewService(repo *Repository, subscriptionSvc SubscriptionService, cfg *config.PaymentConfig) *Service {
	return &Service{
		repo:            repo,
		cinetpay:        NewCinetPayClient(cfg.CinetPayAPIKey, cfg.CinetPaySiteID, cfg.CinetPaySecretKey, cfg.CinetPayBaseURL),
		notchpay:        NewNotchPayClient(cfg.NotchPayPublicKey, cfg.NotchPaySecretKey, cfg.NotchPayBaseURL),
		config:          cfg,
		subscriptionSvc: subscriptionSvc,
	}
}

func (s *Service) InitiatePayment(ctx context.Context, userID string, req *InitiatePaymentRequest) (*InitiatePaymentResponse, error) {
	// Vérifier que le plan existe
	planCfg, ok := provisioning.Plans[provisioning.Plan(req.Plan)]
	if !ok {
		return nil, errors.New("plan invalide")
	}

	// Générer un transaction ID unique
	transactionID := fmt.Sprintf("OS-%d-%s", time.Now().Unix(), userID[:8])

	// Créer le paiement en base avec status pending
	payment := &Payment{
		UserID:        userID,
		TransactionID: transactionID,
		Provider:      req.Provider,
		Amount:        planCfg.Price,
		Status:        StatusPending,
		Plan:          req.Plan,
		PhoneNumber:   req.PhoneNumber,
		Metadata: map[string]interface{}{
			"hostname": req.Hostname,
		},
	}

	created, err := s.repo.Create(ctx, payment)
	if err != nil {
		return nil, err
	}

	// Préparer les URLs de callback
	notifyURL := fmt.Sprintf("%s/api/v1/webhooks/%s", s.config.WebhookBaseURL, req.Provider)
	returnURL := req.ReturnURL
	if returnURL == "" {
		returnURL = fmt.Sprintf("%s/payment/success", s.config.WebhookBaseURL)
	}

	var paymentURL string
	var expiresAt int64

	// Créer la transaction sur le provider
	switch req.Provider {
	case ProviderCinetPay:
		resp, err := s.cinetpay.CreateTransaction(planCfg.Price, transactionID, notifyURL, returnURL)
		if err != nil {
			log.Printf("❌ Erreur création transaction CinetPay: %v", err)
			return nil, errors.New("impossible d'initier le paiement — veuillez réessayer")
		}

		if paymentLink, ok := resp.Data["payment_url"].(string); ok {
			paymentURL = paymentLink
		}
		expiresAt = time.Now().Add(30 * time.Minute).Unix()

	case ProviderNotchPay:
		resp, err := s.notchpay.CreatePayment(planCfg.Price, transactionID, req.PhoneNumber, notifyURL)
		if err != nil {
			log.Printf("❌ Erreur création paiement NotchPay: %v", err)
			return nil, errors.New("impossible d'initier le paiement — veuillez réessayer")
		}

		paymentURL = resp.Transaction.AuthURL
		expiresAt = time.Now().Add(30 * time.Minute).Unix()

	default:
		return nil, errors.New("provider de paiement non supporté")
	}

	return &InitiatePaymentResponse{
		PaymentID:     created.ID,
		PaymentURL:    paymentURL,
		TransactionID: transactionID,
		Amount:        planCfg.Price,
		ExpiresAt:     expiresAt,
	}, nil
}

func (s *Service) ProcessCinetPayWebhook(ctx context.Context, payload map[string]interface{}) error {
	// Extraire les données du webhook
	transactionID, _ := payload["cpm_trans_id"].(string)
	status, _ := payload["cpm_result"].(string)
	amountStr, _ := payload["cpm_amount"].(string)
	signature, _ := payload["signature"].(string)

	if transactionID == "" || status == "" {
		return errors.New("webhook invalide")
	}

	// Vérifier la signature
	if !s.cinetpay.VerifySignature(transactionID, amountStr, status, signature) {
		log.Printf("❌ Signature invalide pour transaction %s", transactionID)
		return errors.New("signature invalide")
	}

	// Récupérer le paiement
	payment, err := s.repo.FindByTransactionID(ctx, transactionID)
	if err != nil {
		log.Printf("❌ Paiement introuvable: %s", transactionID)
		return err
	}

	// Idempotence: si déjà traité, ignorer
	if payment.Status == StatusCompleted {
		log.Printf("✅ Paiement %s déjà traité (idempotence)", transactionID)
		return nil
	}

	// Mettre à jour le statut
	var newStatus PaymentStatus
	if status == "00" || status == "ACCEPTED" {
		newStatus = StatusCompleted
	} else {
		newStatus = StatusFailed
	}

	err = s.repo.UpdateStatus(ctx, payment.ID, newStatus, payload)
	if err != nil {
		return err
	}

	// Si paiement réussi, déclencher la création de subscription
	if newStatus == StatusCompleted {
		go s.onPaymentSuccess(payment.ID)
	}

	return nil
}

func (s *Service) ProcessNotchPayWebhook(ctx context.Context, payload map[string]interface{}, signature string, rawBody string) error {
	// Vérifier la signature
	if !s.notchpay.VerifyWebhook(signature, rawBody) {
		log.Printf("❌ Signature webhook NotchPay invalide")
		return errors.New("signature invalide")
	}

	// Extraire les données
	transactionData, ok := payload["transaction"].(map[string]interface{})
	if !ok {
		return errors.New("webhook invalide")
	}

	reference, _ := transactionData["reference"].(string)
	status, _ := transactionData["status"].(string)

	// Récupérer le paiement
	payment, err := s.repo.FindByTransactionID(ctx, reference)
	if err != nil {
		log.Printf("❌ Paiement introuvable: %s", reference)
		return err
	}

	// Idempotence
	if payment.Status == StatusCompleted {
		log.Printf("✅ Paiement %s déjà traité (idempotence)", reference)
		return nil
	}

	// Mettre à jour le statut
	var newStatus PaymentStatus
	if status == "complete" || status == "success" {
		newStatus = StatusCompleted
	} else if status == "failed" {
		newStatus = StatusFailed
	} else {
		newStatus = StatusPending
	}

	err = s.repo.UpdateStatus(ctx, payment.ID, newStatus, payload)
	if err != nil {
		return err
	}

	// Si paiement réussi, déclencher la création de subscription
	if newStatus == StatusCompleted {
		go s.onPaymentSuccess(payment.ID)
	}

	return nil
}

func (s *Service) onPaymentSuccess(paymentID string) {
	ctx := context.Background()

	// Récupérer le paiement
	payment, err := s.repo.FindByID(ctx, paymentID)
	if err != nil {
		log.Printf("❌ Erreur récupération paiement %s: %v", paymentID, err)
		return
	}

	// Extraire le hostname des metadata
	hostname, ok := payment.Metadata["hostname"].(string)
	if !ok || hostname == "" {
		log.Printf("❌ Hostname manquant dans metadata pour paiement %s", paymentID)
		return
	}

	log.Printf("✅ Paiement %s validé — création subscription pour user %s", paymentID, payment.UserID)

	_, err = s.subscriptionSvc.CreateFromPayment(ctx, payment.UserID, payment.ID, payment.Plan, hostname)
	if err != nil {
		log.Printf("❌ Erreur création subscription pour paiement %s: %v", paymentID, err)
		return
	}

	log.Printf("✅ Subscription créée avec succès depuis paiement %s", paymentID)
}

func (s *Service) GetUserPayments(ctx context.Context, userID string) ([]*PaymentResponse, error) {
	payments, err := s.repo.ListByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*PaymentResponse, len(payments))
	for i, p := range payments {
		responses[i] = &PaymentResponse{
			ID:            p.ID,
			TransactionID: p.TransactionID,
			Provider:      p.Provider,
			Amount:        p.Amount,
			Status:        p.Status,
			Plan:          p.Plan,
			CreatedAt:     p.CreatedAt,
		}
	}

	return responses, nil
}

func (s *Service) GetPaymentByID(ctx context.Context, id string) (*Payment, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *Service) GetUserPaymentByTransactionID(ctx context.Context, userID, transactionID string) (*PaymentResponse, error) {
	payment, err := s.repo.FindByTransactionID(ctx, transactionID)
	if err != nil {
		return nil, err
	}

	if payment.UserID != userID {
		return nil, errors.New("paiement introuvable")
	}

	return &PaymentResponse{
		ID:            payment.ID,
		TransactionID: payment.TransactionID,
		Provider:      payment.Provider,
		Amount:        payment.Amount,
		Status:        payment.Status,
		Plan:          payment.Plan,
		CreatedAt:     payment.CreatedAt,
	}, nil
}
