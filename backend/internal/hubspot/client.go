package hubspot

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

// Required OAuth scopes (private app): crm.objects.companies.read, crm.objects.companies.write.
// Optional (only if HUBSPOT_SYNC_DEALS=true): crm.objects.deals.write.
// Create company property delphinium_prospectus_url (or set HUBSPOT_PROSPECTUS_URL_PROPERTY).
// Value written is WEB_BASE_URL/quotes/{quoteId}; that quote GET is public for CRM viewers.

type Client struct {
	token              string
	http               *http.Client
	apiURL             string
	prospectusURLProp  string
	syncDeals          bool
}

type SyncResult struct {
	DealID  string `json:"dealId"`
	QuoteID string `json:"quoteId"`
	DealURL string `json:"dealUrl"`
}

type Company struct {
	ID     string            `json:"id"`
	Name   string            `json:"name"`
	Domain string            `json:"domain,omitempty"`
	City   string            `json:"city,omitempty"`
	State  string            `json:"state,omitempty"`
	URL    string            `json:"url"`
	Props  map[string]string `json:"-"`
}

type CompanySyncResult struct {
	CompanyID  string `json:"companyId"`
	CompanyURL string `json:"companyUrl"`
	Property   string `json:"property"`
	Fallback   bool   `json:"fallback,omitempty"`
}

func NewClient() *Client {
	prop := strings.TrimSpace(os.Getenv("HUBSPOT_PROSPECTUS_URL_PROPERTY"))
	if prop == "" {
		prop = "delphinium_prospectus_url"
	}
	syncDeals := envTruthy(os.Getenv("HUBSPOT_SYNC_DEALS"))
	return &Client{
		token:             os.Getenv("HUBSPOT_ACCESS_TOKEN"),
		apiURL:            "https://api.hubapi.com",
		http:              &http.Client{Timeout: 15 * time.Second},
		prospectusURLProp: prop,
		syncDeals:         syncDeals,
	}
}

func envTruthy(v string) bool {
	switch strings.ToLower(strings.TrimSpace(v)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

func (c *Client) Enabled() bool {
	t := strings.TrimSpace(c.token)
	return t != "" && t != "-"
}

func (c *Client) DealSyncEnabled() bool {
	return c.Enabled() && c.syncDeals
}

func (c *Client) ProspectusURLProperty() string {
	return c.prospectusURLProp
}

func companyURL(id string) string {
	return fmt.Sprintf("https://app.hubspot.com/contacts/company/%s", id)
}

func (c *Client) do(ctx context.Context, method, path string, body any) (*http.Response, error) {
	var rdr io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		rdr = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.apiURL+path, rdr)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	return c.http.Do(req)
}

type companyPropsPayload struct {
	Properties map[string]string `json:"properties"`
}

type hsCompanyObject struct {
	ID         string            `json:"id"`
	Properties map[string]string `json:"properties"`
}

func mapCompany(obj hsCompanyObject) Company {
	p := obj.Properties
	if p == nil {
		p = map[string]string{}
	}
	return Company{
		ID:     obj.ID,
		Name:   p["name"],
		Domain: p["domain"],
		City:   p["city"],
		State:  p["state"],
		URL:    companyURL(obj.ID),
		Props:  p,
	}
}

// SearchCompanies finds companies by name (CONTAINS_TOKEN). Returns empty when HubSpot is disabled.
func (c *Client) SearchCompanies(ctx context.Context, query string, limit int) ([]Company, error) {
	if !c.Enabled() {
		return nil, fmt.Errorf("hubspot not configured")
	}
	q := strings.TrimSpace(query)
	if q == "" {
		return []Company{}, nil
	}
	if limit <= 0 || limit > 25 {
		limit = 10
	}
	payload := map[string]any{
		"filterGroups": []map[string]any{{
			"filters": []map[string]any{{
				"propertyName": "name",
				"operator":     "CONTAINS_TOKEN",
				"value":        q,
			}},
		}},
		"properties": []string{"name", "domain", "city", "state", "description"},
		"limit":      limit,
	}
	resp, err := c.do(ctx, http.MethodPost, "/crm/v3/objects/companies/search", payload)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("hubspot company search failed: %d", resp.StatusCode)
	}
	var out struct {
		Results []hsCompanyObject `json:"results"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return nil, err
	}
	companies := make([]Company, 0, len(out.Results))
	for _, r := range out.Results {
		companies = append(companies, mapCompany(r))
	}
	return companies, nil
}

// GetCompany fetches a company by HubSpot object id.
func (c *Client) GetCompany(ctx context.Context, id string) (Company, error) {
	if !c.Enabled() {
		return Company{}, fmt.Errorf("hubspot not configured")
	}
	id = strings.TrimSpace(id)
	if id == "" {
		return Company{}, fmt.Errorf("company id required")
	}
	path := fmt.Sprintf("/crm/v3/objects/companies/%s?properties=name,domain,city,state,description,%s",
		id, c.prospectusURLProp)
	resp, err := c.do(ctx, http.MethodGet, path, nil)
	if err != nil {
		return Company{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return Company{}, fmt.Errorf("hubspot get company failed: %d", resp.StatusCode)
	}
	var obj hsCompanyObject
	if err := json.NewDecoder(resp.Body).Decode(&obj); err != nil {
		return Company{}, err
	}
	return mapCompany(obj), nil
}

// UpdateCompanyProspectusUrl PATCHes the configured custom property. If that fails
// (property missing), appends the URL to the company description.
func (c *Client) UpdateCompanyProspectusUrl(ctx context.Context, companyID, prospectusURL string) (CompanySyncResult, error) {
	if !c.Enabled() {
		return CompanySyncResult{}, nil
	}
	companyID = strings.TrimSpace(companyID)
	prospectusURL = strings.TrimSpace(prospectusURL)
	if companyID == "" || prospectusURL == "" {
		return CompanySyncResult{}, nil
	}

	result := CompanySyncResult{
		CompanyID:  companyID,
		CompanyURL: companyURL(companyID),
		Property:   c.prospectusURLProp,
	}

	err := c.patchCompanyProps(ctx, companyID, map[string]string{
		c.prospectusURLProp: prospectusURL,
	})
	if err == nil {
		return result, nil
	}

	// Fallback: append to description / notes-style field.
	co, getErr := c.GetCompany(ctx, companyID)
	desc := ""
	if getErr == nil {
		desc = co.Props["description"]
	}
	line := "Delphinium prospectus: " + prospectusURL
	if strings.Contains(desc, prospectusURL) {
		result.Fallback = true
		result.Property = "description"
		return result, nil
	}
	if strings.TrimSpace(desc) == "" {
		desc = line
	} else {
		desc = strings.TrimSpace(desc) + "\n\n" + line
	}
	if patchErr := c.patchCompanyProps(ctx, companyID, map[string]string{"description": desc}); patchErr != nil {
		return result, fmt.Errorf("hubspot company update failed (property %q: %v; description: %w)", c.prospectusURLProp, err, patchErr)
	}
	result.Fallback = true
	result.Property = "description"
	return result, nil
}

func (c *Client) patchCompanyProps(ctx context.Context, companyID string, props map[string]string) error {
	resp, err := c.do(ctx, http.MethodPatch, "/crm/v3/objects/companies/"+companyID, companyPropsPayload{Properties: props})
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 512))
		return fmt.Errorf("status %d: %s", resp.StatusCode, strings.TrimSpace(string(body)))
	}
	return nil
}

type dealPayload struct {
	Properties map[string]string `json:"properties"`
}

// SyncDeal creates a HubSpot deal. Disabled unless HUBSPOT_SYNC_DEALS is truthy.
func (c *Client) SyncDeal(ctx context.Context, schoolName string, amount float64, notes string) (SyncResult, error) {
	if !c.DealSyncEnabled() {
		return SyncResult{}, nil
	}
	body := dealPayload{Properties: map[string]string{
		"dealname":    fmt.Sprintf("Delphinium — %s", schoolName),
		"amount":      fmt.Sprintf("%.2f", amount),
		"pipeline":    "default",
		"dealstage":   "appointmentscheduled",
		"description": notes,
	}}
	resp, err := c.do(ctx, http.MethodPost, "/crm/v3/objects/deals", body)
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
