package payment

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

type NotchPayClient struct {
	publicKey string
	secretKey string
	baseURL   string
	client    *http.Client
}

type NotchPayRequest struct {
	Amount      int    `json:"amount"`
	Currency    string `json:"currency"`
	Reference   string `json:"reference"`
	Description string `json:"description"`
	Phone       string `json:"phone"`
	Email       string `json:"email,omitempty"`
	CallbackURL string `json:"callback"`
}

type NotchPayResponse struct {
	Transaction struct {
		Reference   string `json:"reference"`
		Status      string `json:"status"`
		Amount      int    `json:"amount"`
		Fee         int    `json:"fee"`
		Currency    string `json:"currency"`
		Description string `json:"description"`
		AuthURL     string `json:"authorization_url"`
	} `json:"transaction"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

func NewNotchPayClient(publicKey, secretKey, baseURL string) *NotchPayClient {
	return &NotchPayClient{
		publicKey: publicKey,
		secretKey: secretKey,
		baseURL:   baseURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *NotchPayClient) CreatePayment(amount int, reference, phone, callbackURL string) (*NotchPayResponse, error) {
	reqBody := NotchPayRequest{
		Amount:      amount,
		Currency:    "XAF", // FCFA
		Reference:   reference,
		Description: "Abonnement OpenSpace",
		Phone:       phone,
		CallbackURL: callbackURL,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/payments/initialize", c.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.publicKey)
	req.Header.Set("X-Grant", c.secretKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var notchPayResp NotchPayResponse
	if err := json.Unmarshal(body, &notchPayResp); err != nil {
		return nil, err
	}

	if notchPayResp.Code != "201" && notchPayResp.Code != "200" {
		return nil, errors.New(notchPayResp.Message)
	}

	return &notchPayResp, nil
}

func (c *NotchPayClient) VerifyWebhook(signature, body string) bool {
	// NotchPay signature: HMAC SHA256 with secret key
	mac := hmac.New(sha256.New, []byte(c.secretKey))
	mac.Write([]byte(body))
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func (c *NotchPayClient) GetPaymentStatus(reference string) (*NotchPayResponse, error) {
	url := fmt.Sprintf("%s/payments/%s", c.baseURL, reference)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", c.publicKey)

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var notchPayResp NotchPayResponse
	if err := json.Unmarshal(body, &notchPayResp); err != nil {
		return nil, err
	}

	return &notchPayResp, nil
}
