package hubspot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Client struct {
	token  string
	http   *http.Client
	apiURL string
}

type SyncResult struct {
	DealID    string `json:"dealId"`
	QuoteID   string `json:"quoteId"`
	DealURL   string `json:"dealUrl"`
}

func NewClient() *Client {
	return &Client{
		token:  os.Getenv("HUBSPOT_ACCESS_TOKEN"),
		apiURL: "https://api.hubapi.com",
		http:   &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *Client) Enabled() bool {
	return c.token != ""
}

type dealPayload struct {
	Properties map[string]string `json:"properties"`
}

func (c *Client) SyncDeal(ctx context.Context, schoolName string, amount float64, notes string) (SyncResult, error) {
	if !c.Enabled() {
		return SyncResult{}, nil
	}
	body := dealPayload{Properties: map[string]string{
		"dealname":   fmt.Sprintf("Delphinium — %s", schoolName),
		"amount":     fmt.Sprintf("%.2f", amount),
		"pipeline":   "default",
		"dealstage":  "appointmentscheduled",
		"description": notes,
	}}
	b, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.apiURL+"/crm/v3/objects/deals", bytes.NewReader(b))
	if err != nil {
		return SyncResult{}, err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return SyncResult{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return SyncResult{}, fmt.Errorf("hubspot deal create failed: %d", resp.StatusCode)
	}
	var out struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return SyncResult{}, err
	}
	return SyncResult{
		DealID:  out.ID,
		DealURL: fmt.Sprintf("https://app.hubspot.com/contacts/deal/%s", out.ID),
	}, nil
}
