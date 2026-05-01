package domain

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

type OpenProviderClient struct {
	username string
	password string
	apiURL   string
	token    string
	client   *http.Client
}

type AuthRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Code int `json:"code"`
	Data struct {
		Token string `json:"token"`
	} `json:"data"`
}

type DomainCheckRequest struct {
	Domains []struct {
		Name      string `json:"name"`
		Extension string `json:"extension"`
	} `json:"domains"`
}

type DomainCheckResponse struct {
	Code int `json:"code"`
	Data struct {
		Results []struct {
			Domain    string  `json:"domain"`
			Status    string  `json:"status"`
			IsPremium bool    `json:"is_premium"`
			Price     float64 `json:"price"`
		} `json:"results"`
	} `json:"data"`
}

type DomainCreateRequest struct {
	AcceptPremiumFee int    `json:"accept_premium_fee"`
	Domain           struct {
		Name      string `json:"name"`
		Extension string `json:"extension"`
	} `json:"domain"`
	Period int `json:"period"` // En années
}

type DomainCreateResponse struct {
	Code int `json:"code"`
	Data struct {
		ID     int    `json:"id"`
		Domain string `json:"domain"`
		Status string `json:"status"`
	} `json:"data"`
}

type DNSZoneRequest struct {
	Name    string      `json:"name"`
	Type    string      `json:"type"`
	Records []DNSRecord `json:"records"`
}

type DNSRecord struct {
	Type  string `json:"type"`
	Name  string `json:"name"`
	Value string `json:"value"`
	TTL   int    `json:"ttl"`
}

type DNSZoneResponse struct {
	Code int `json:"code"`
	Data struct {
		ID int `json:"id"`
	} `json:"data"`
}

func NewOpenProviderClient(username, password, apiURL string) *OpenProviderClient {
	return &OpenProviderClient{
		username: username,
		password: password,
		apiURL:   apiURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (c *OpenProviderClient) Authenticate() error {
	reqBody := AuthRequest{
		Username: c.username,
		Password: c.password,
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/auth/login", c.apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var authResp AuthResponse
	if err := json.Unmarshal(body, &authResp); err != nil {
		return err
	}

	if authResp.Code != 0 {
		return errors.New("authentification OpenProvider échouée")
	}

	c.token = authResp.Data.Token
	return nil
}

func (c *OpenProviderClient) SearchDomain(domainName string) (bool, float64, error) {
	// S'assurer d'avoir un token valide
	if c.token == "" {
		if err := c.Authenticate(); err != nil {
			return false, 0, err
		}
	}

	// Séparer nom et extension (ex: "example.com" → "example" + "com")
	// Simplification: on assume que l'extension est après le dernier point
	var name, extension string
	for i := len(domainName) - 1; i >= 0; i-- {
		if domainName[i] == '.' {
			name = domainName[:i]
			extension = domainName[i+1:]
			break
		}
	}

	reqBody := DomainCheckRequest{
		Domains: []struct {
			Name      string `json:"name"`
			Extension string `json:"extension"`
		}{
			{Name: name, Extension: extension},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return false, 0, err
	}

	url := fmt.Sprintf("%s/domains/check", c.apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return false, 0, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))

	resp, err := c.client.Do(req)
	if err != nil {
		return false, 0, err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, 0, err
	}

	var checkResp DomainCheckResponse
	if err := json.Unmarshal(body, &checkResp); err != nil {
		return false, 0, err
	}

	if len(checkResp.Data.Results) == 0 {
		return false, 0, errors.New("aucun résultat de recherche")
	}

	result := checkResp.Data.Results[0]
	available := result.Status == "free"
	price := result.Price

	// Convertir EUR en FCFA (1 EUR ≈ 655.957 FCFA)
	priceFCFA := price * 655.957

	return available, priceFCFA, nil
}

func (c *OpenProviderClient) PurchaseDomain(domainName string, years int) (string, error) {
	// S'assurer d'avoir un token valide
	if c.token == "" {
		if err := c.Authenticate(); err != nil {
			return "", err
		}
	}

	// Séparer nom et extension
	var name, extension string
	for i := len(domainName) - 1; i >= 0; i-- {
		if domainName[i] == '.' {
			name = domainName[:i]
			extension = domainName[i+1:]
			break
		}
	}

	reqBody := DomainCreateRequest{
		AcceptPremiumFee: 0,
		Period:           years,
	}
	reqBody.Domain.Name = name
	reqBody.Domain.Extension = extension

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", err
	}

	url := fmt.Sprintf("%s/domains/create", c.apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))

	resp, err := c.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var createResp DomainCreateResponse
	if err := json.Unmarshal(body, &createResp); err != nil {
		return "", err
	}

	if createResp.Code != 0 {
		return "", errors.New("échec de l'achat du domaine")
	}

	return fmt.Sprintf("%d", createResp.Data.ID), nil
}

func (c *OpenProviderClient) ConfigureDNS(domainName string, ip string) error {
	// S'assurer d'avoir un token valide
	if c.token == "" {
		if err := c.Authenticate(); err != nil {
			return err
		}
	}

	reqBody := DNSZoneRequest{
		Name: domainName,
		Type: "master",
		Records: []DNSRecord{
			{
				Type:  "A",
				Name:  "@",
				Value: ip,
				TTL:   3600,
			},
			{
				Type:  "A",
				Name:  "www",
				Value: ip,
				TTL:   3600,
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/dns/zones", c.apiURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.token))

	resp, err := c.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	var dnsResp DNSZoneResponse
	if err := json.Unmarshal(body, &dnsResp); err != nil {
		return err
	}

	if dnsResp.Code != 0 {
		return errors.New("échec de la configuration DNS")
	}

	return nil
}
