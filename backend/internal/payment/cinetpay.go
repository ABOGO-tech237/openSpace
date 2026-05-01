package payment

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

type CinetPayClient struct {
	apiKey    string
	siteID    string
	secretKey string
	baseURL   string
	client    *http.Client
}

type CinetPayRequest struct {
	APIKey        string `json:"apikey"`
	SiteID        string `json:"site_id"`
	TransactionID string `json:"transaction_id"`
	Amount        int    `json:"amount"`
	Currency      string `json:"currency"`
	Description   string `json:"description"`
	NotifyURL     string `json:"notify_url"`
	ReturnURL     string `json:"return_url"`
	Channels      string `json:"channels,omitempty"`
	CustomerName  string `json:"customer_name,omitempty"`
	CustomerEmail string `json:"customer_surname,omitempty"`
}

type CinetPayResponse struct {
	Code        string                 `json:"code"`
	Message     string                 `json:"message"`
	Data        map[string]interface{} `json:"data"`
	Description string                 `json:"description"`
}

func NewCinetPayClient(apiKey, siteID, secretKey, baseURL string) *CinetPayClient {
	return &CinetPayClient{
		apiKey:    apiKey,
		siteID:    siteID,
		secretKey: secretKey,
		baseURL:   baseURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *CinetPayClient) CreateTransaction(amount int, transactionID, notifyURL, returnURL string) (*CinetPayResponse, error) {
	reqBody := CinetPayRequest{
		APIKey:        c.apiKey,
		SiteID:        c.siteID,
		TransactionID: transactionID,
		Amount:        amount,
		Currency:      "XAF", // FCFA
		Description:   "Abonnement OpenSpace",
		NotifyURL:     notifyURL,
		ReturnURL:     returnURL,
		Channels:      "ALL", // Mobile Money, Orange Money, MTN, etc.
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/v2/?method=payment", c.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cinetPayResp CinetPayResponse
	if err := json.Unmarshal(body, &cinetPayResp); err != nil {
		return nil, err
	}

	if cinetPayResp.Code != "201" {
		return nil, errors.New(cinetPayResp.Message)
	}

	return &cinetPayResp, nil
}

func (c *CinetPayClient) VerifySignature(transactionID, amount, status, signature string) bool {
	// CinetPay signature format: sha256(apikey + site_id + transaction_id + amount + status + secret_key)
	data := fmt.Sprintf("%s%s%s%s%s%s", c.apiKey, c.siteID, transactionID, amount, status, c.secretKey)
	hash := sha256.Sum256([]byte(data))
	expectedSignature := hex.EncodeToString(hash[:])

	return expectedSignature == signature
}

func (c *CinetPayClient) GetPaymentStatus(transactionID string) (*CinetPayResponse, error) {
	reqBody := map[string]string{
		"apikey":         c.apiKey,
		"site_id":        c.siteID,
		"transaction_id": transactionID,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/v2/?method=checkPayStatus", c.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var cinetPayResp CinetPayResponse
	if err := json.Unmarshal(body, &cinetPayResp); err != nil {
		return nil, err
	}

	return &cinetPayResp, nil
}
