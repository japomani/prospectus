package zoho

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

// ProspectusURLField is the existing Accounts URL field. There is no Prospectus module.
const ProspectusURLField = "Delphinium_Prospectus_URL"

// prospectusURLMax is the field's length limit in Zoho.
const prospectusURLMax = 450

// Scopes: ZohoCRM.modules.accounts.READ, ZohoCRM.modules.accounts.UPDATE.

type Client struct {
	clientID     string
	clientSecret string
	refreshToken string
	accountsURL  string
	apiDomain    string
	http         *http.Client

	mu           sync.Mutex
	accessToken  string
	accessExpiry time.Time
}

type Account struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Website string `json:"website,omitempty"`
}

type SyncResult struct {
	AccountID string `json:"accountId"`
	Property  string `json:"property"`
}

func NewClient() *Client {
	accountsURL := strings.TrimRight(strings.TrimSpace(os.Getenv("ZOHO_ACCOUNTS_URL")), "/")
	if accountsURL == "" {
		accountsURL = "https://accounts.zoho.com"
	}
	apiDomain := strings.TrimRight(strings.TrimSpace(os.Getenv("ZOHO_API_DOMAIN")), "/")
	if apiDomain == "" {
		apiDomain = "https://www.zohoapis.com"
	}
	return &Client{
		clientID:     os.Getenv("ZOHO_CLIENT_ID"),
		clientSecret: os.Getenv("ZOHO_CLIENT_SECRET"),
		refreshToken: os.Getenv("ZOHO_REFRESH_TOKEN"),
		accountsURL:  accountsURL,
		apiDomain:    apiDomain,
		http:         &http.Client{Timeout: 15 * time.Second},
	}
}

func configured(v string) bool {
	t := strings.TrimSpace(v)
	return t != "" && t != "-"
}

// Enabled reports whether a refresh-token grant can be attempted.
// Empty or "-" credentials disable the client so quote save does not call Zoho.
func (c *Client) Enabled() bool {
	return c != nil && configured(c.clientID) && configured(c.clientSecret) && configured(c.refreshToken)
}

type tokenResponse struct {
	AccessToken string `json:"access_token"`
	ExpiresIn   int    `json:"expires_in"`
	Error       string `json:"error"`
}

func (c *Client) token(ctx context.Context) (string, error) {
	if !c.Enabled() {
		return "", fmt.Errorf("zoho not configured")
	}
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.accessToken != "" && time.Now().Before(c.accessExpiry) {
		return c.accessToken, nil
	}
	form := url.Values{}
	form.Set("grant_type", "refresh_token")
	form.Set("refresh_token", strings.TrimSpace(c.refreshToken))
	form.Set("client_id", strings.TrimSpace(c.clientID))
	form.Set("client_secret", strings.TrimSpace(c.clientSecret))
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.accountsURL+"/oauth/v2/token", strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(io.LimitReader(resp.Body, 4096))
	if err != nil {
		return "", err
	}
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("zoho token refresh failed: %d", resp.StatusCode)
	}
	var out tokenResponse
	if err := json.Unmarshal(body, &out); err != nil {
		return "", err
	}
	if out.AccessToken == "" {
		if out.Error != "" {
			return "", fmt.Errorf("zoho token refresh failed: %s", out.Error)
		}
		return "", fmt.Errorf("zoho token refresh failed: empty access token")
	}
	ttl := out.ExpiresIn
	if ttl <= 0 {
		ttl = 3600
	}
	skew := 60
	if ttl <= skew {
		skew = 0
	}
	c.accessToken = out.AccessToken
	c.accessExpiry = time.Now().Add(time.Duration(ttl-skew) * time.Second)
	return c.accessToken, nil
}

func (c *Client) do(ctx context.Context, method, path string, body any) (*http.Response, error) {
	access, err := c.token(ctx)
	if err != nil {
		return nil, err
	}
	var rdr io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		rdr = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.apiDomain+path, rdr)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Zoho-oauthtoken "+access)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return c.http.Do(req)
}

type accountRecord struct {
	ID          string `json:"id"`
	AccountName string `json:"Account_Name"`
	Website     string `json:"Website"`
}

func mapAccount(row accountRecord) Account {
	return Account{
		ID:      row.ID,
		Name:    row.AccountName,
		Website: row.Website,
	}
}

// SearchAccounts finds Accounts by word. An empty query does not call Zoho.
func (c *Client) SearchAccounts(ctx context.Context, query string) ([]Account, error) {
	if !c.Enabled() {
		return nil, fmt.Errorf("zoho not configured")
	}
	q := strings.TrimSpace(query)
	if q == "" {
		return []Account{}, nil
	}
	path := "/crm/v8/Accounts/search?word=" + url.QueryEscape(q) + "&fields=Account_Name,Website"
	resp, err := c.do(ctx, http.MethodGet, path, nil)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusNoContent {
		return []Account{}, nil
	}
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("zoho account search failed: %d", resp.StatusCode)
	}
	var out struct {
		Data []accountRecord `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	accounts := make([]Account, 0, len(out.Data))
	for _, row := range out.Data {
		if row.ID == "" {
			continue
		}
		accounts = append(accounts, mapAccount(row))
	}
	return accounts, nil
}

// GetAccount fetches one Account by id.
func (c *Client) GetAccount(ctx context.Context, id string) (Account, error) {
	if !c.Enabled() {
		return Account{}, fmt.Errorf("zoho not configured")
	}
	id = strings.Trim(strings.TrimSpace(id), "/")
	if id == "" {
		return Account{}, fmt.Errorf("account id required")
	}
	path := "/crm/v8/Accounts/" + url.PathEscape(id) + "?fields=Account_Name,Website"
	resp, err := c.do(ctx, http.MethodGet, path, nil)
	if err != nil {
		return Account{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return Account{}, fmt.Errorf("zoho get account failed: %d", resp.StatusCode)
	}
	var out struct {
		Data []accountRecord `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return Account{}, err
	}
	if len(out.Data) == 0 || out.Data[0].ID == "" {
		return Account{}, fmt.Errorf("zoho account not found")
	}
	return mapAccount(out.Data[0]), nil
}

// UpdateProspectusURL writes the quote URL onto Accounts.Delphinium_Prospectus_URL.
// One call per save. Disabled credentials return without calling Zoho.
func (c *Client) UpdateProspectusURL(ctx context.Context, accountID, prospectusURL string) (SyncResult, error) {
	if !c.Enabled() {
		return SyncResult{}, nil
	}
	accountID = strings.TrimSpace(accountID)
	prospectusURL = strings.TrimSpace(prospectusURL)
	if accountID == "" || prospectusURL == "" {
		return SyncResult{}, nil
	}
	if len(prospectusURL) > prospectusURLMax {
		return SyncResult{}, fmt.Errorf("prospectus URL exceeds %d characters", prospectusURLMax)
	}
	result := SyncResult{AccountID: accountID, Property: ProspectusURLField}
	// trigger: [] tells Zoho not to run Account workflows for this write.
	payload := map[string]any{
		"data": []map[string]string{{
			ProspectusURLField: prospectusURL,
		}},
		"trigger": []string{},
	}
	resp, err := c.do(ctx, http.MethodPut, "/crm/v8/Accounts/"+url.PathEscape(accountID), payload)
	if err != nil {
		return result, err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))
	if resp.StatusCode >= 300 {
		return result, fmt.Errorf("zoho account update failed: %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	var out struct {
		Data []struct {
			Code    string `json:"code"`
			Status  string `json:"status"`
			Message string `json:"message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &out); err != nil {
		return result, err
	}
	if len(out.Data) > 0 && !strings.EqualFold(out.Data[0].Status, "success") {
		msg := out.Data[0].Message
		if msg == "" {
			msg = out.Data[0].Code
		}
		return result, fmt.Errorf("zoho account update failed: %s", msg)
	}
	return result, nil
}
