package zoho

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync/atomic"
	"testing"
)

func testClient(t *testing.T, srv *httptest.Server) *Client {
	t.Helper()
	t.Setenv("ZOHO_CLIENT_ID", "client-id")
	t.Setenv("ZOHO_CLIENT_SECRET", "client-secret")
	t.Setenv("ZOHO_REFRESH_TOKEN", "refresh-token")
	t.Setenv("ZOHO_ACCOUNTS_URL", srv.URL)
	t.Setenv("ZOHO_API_DOMAIN", srv.URL)
	c := NewClient()
	c.http = srv.Client()
	return c
}

func TestEnabledRequiresRefreshGrant(t *testing.T) {
	t.Setenv("ZOHO_CLIENT_ID", "client-id")
	t.Setenv("ZOHO_CLIENT_SECRET", "client-secret")
	t.Setenv("ZOHO_REFRESH_TOKEN", "-")
	if NewClient().Enabled() {
		t.Fatal("expected placeholder refresh token to disable client")
	}
	t.Setenv("ZOHO_REFRESH_TOKEN", "")
	if NewClient().Enabled() {
		t.Fatal("expected empty refresh token to disable client")
	}
	t.Setenv("ZOHO_CLIENT_ID", "")
	t.Setenv("ZOHO_REFRESH_TOKEN", "refresh-token")
	if NewClient().Enabled() {
		t.Fatal("expected missing client id to disable client")
	}
}

func TestDisabledClientDoesNotCallZoho(t *testing.T) {
	var hits atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		hits.Add(1)
		t.Errorf("unexpected call %s %s", r.Method, r.URL.Path)
	}))
	defer srv.Close()
	t.Setenv("ZOHO_CLIENT_ID", "")
	t.Setenv("ZOHO_CLIENT_SECRET", "")
	t.Setenv("ZOHO_REFRESH_TOKEN", "")
	t.Setenv("ZOHO_ACCOUNTS_URL", srv.URL)
	t.Setenv("ZOHO_API_DOMAIN", srv.URL)
	c := NewClient()
	c.http = srv.Client()
	if _, err := c.UpdateProspectusURL(context.Background(), "acc-1", "https://example.com/quotes/1"); err != nil {
		t.Fatal(err)
	}
	if hits.Load() != 0 {
		t.Fatalf("zoho was called %d times", hits.Load())
	}
}

func TestSearchRefreshesOnceAndMapsAccounts(t *testing.T) {
	var refreshes atomic.Int32
	var searches atomic.Int32
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch {
		case r.Method == http.MethodPost && r.URL.Path == "/oauth/v2/token":
			refreshes.Add(1)
			if err := r.ParseForm(); err != nil {
				t.Fatal(err)
			}
			if r.Form.Get("grant_type") != "refresh_token" || r.Form.Get("refresh_token") != "refresh-token" {
				t.Fatalf("token form: %v", r.Form)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access-1", "expires_in": 3600})
		case r.Method == http.MethodGet && r.URL.Path == "/crm/v8/Accounts/search":
			searches.Add(1)
			if got := r.Header.Get("Authorization"); got != "Zoho-oauthtoken access-1" {
				t.Fatalf("authorization %q", got)
			}
			if r.URL.Query().Get("word") != "Milpark" || r.URL.Query().Get("fields") != "Account_Name,Website" {
				t.Fatalf("query %s", r.URL.RawQuery)
			}
			_ = json.NewEncoder(w).Encode(map[string]any{
				"data": []map[string]string{{
					"id":           "acc-milpark",
					"Account_Name": "Milpark",
					"Website":      "https://milpark.ac.za",
				}},
			})
		default:
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
	}))
	defer srv.Close()
	c := testClient(t, srv)
	ctx := context.Background()
	first, err := c.SearchAccounts(ctx, "Milpark")
	if err != nil {
		t.Fatal(err)
	}
	second, err := c.SearchAccounts(ctx, " Milpark ")
	if err != nil {
		t.Fatal(err)
	}
	if refreshes.Load() != 1 || searches.Load() != 2 {
		t.Fatalf("refreshes=%d searches=%d", refreshes.Load(), searches.Load())
	}
	if len(first) != 1 || first[0].ID != "acc-milpark" || first[0].Name != "Milpark" || first[0].Website != "https://milpark.ac.za" {
		t.Fatalf("first %#v", first)
	}
	if len(second) != 1 {
		t.Fatalf("second %#v", second)
	}
}

func TestSearchEmptyQuerySkipsZoho(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
	}))
	defer srv.Close()
	c := testClient(t, srv)
	got, err := c.SearchAccounts(context.Background(), "  ")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 0 {
		t.Fatalf("got %#v", got)
	}
}

func TestSearchNoContent(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/oauth/v2/token" {
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access-1", "expires_in": 3600})
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	defer srv.Close()
	c := testClient(t, srv)
	got, err := c.SearchAccounts(context.Background(), "none")
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 0 {
		t.Fatalf("got %#v", got)
	}
}

func TestGetAccount(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/oauth/v2/token" {
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access-1", "expires_in": 3600})
			return
		}
		if r.Method != http.MethodGet || r.URL.Path != "/crm/v8/Accounts/acc-1" {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]string{{"id": "acc-1", "Account_Name": "Milpark", "Website": "milpark.ac.za"}},
		})
	}))
	defer srv.Close()
	c := testClient(t, srv)
	got, err := c.GetAccount(context.Background(), "acc-1")
	if err != nil {
		t.Fatal(err)
	}
	if got.Name != "Milpark" || got.Website != "milpark.ac.za" {
		t.Fatalf("%#v", got)
	}
}

func TestUpdateProspectusURL(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/oauth/v2/token" {
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access-1", "expires_in": 3600})
			return
		}
		if r.Method != http.MethodPut || r.URL.Path != "/crm/v8/Accounts/acc-1" {
			t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
		}
		if got := r.Header.Get("Authorization"); got != "Zoho-oauthtoken access-1" {
			t.Fatalf("authorization %q", got)
		}
		raw, _ := io.ReadAll(r.Body)
		var body struct {
			Data    []map[string]string `json:"data"`
			Trigger []string            `json:"trigger"`
		}
		if err := json.Unmarshal(raw, &body); err != nil {
			t.Fatal(err)
		}
		if len(body.Data) != 1 || body.Data[0][ProspectusURLField] != "https://example.com/quotes/q1" {
			t.Fatalf("body %s", raw)
		}
		if body.Trigger == nil || len(body.Trigger) != 0 {
			t.Fatalf("trigger %s", raw)
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]string{{"code": "SUCCESS", "status": "success"}},
		})
	}))
	defer srv.Close()
	c := testClient(t, srv)
	got, err := c.UpdateProspectusURL(context.Background(), "acc-1", "https://example.com/quotes/q1")
	if err != nil {
		t.Fatal(err)
	}
	if got.AccountID != "acc-1" || got.Property != ProspectusURLField {
		t.Fatalf("%#v", got)
	}
}

func TestUpdateProspectusURLRejectsAPIError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/oauth/v2/token" {
			_ = json.NewEncoder(w).Encode(map[string]any{"access_token": "access-1", "expires_in": 3600})
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{
			"data": []map[string]string{{"code": "INVALID_DATA", "status": "error", "message": "invalid"}},
		})
	}))
	defer srv.Close()
	c := testClient(t, srv)
	_, err := c.UpdateProspectusURL(context.Background(), "acc-1", "https://example.com/quotes/q1")
	if err == nil || !strings.Contains(err.Error(), "invalid") {
		t.Fatalf("err %v", err)
	}
}

func TestUpdateProspectusURLTooLong(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatalf("unexpected %s %s", r.Method, r.URL.Path)
	}))
	defer srv.Close()
	c := testClient(t, srv)
	long := "https://example.com/" + strings.Repeat("a", 450)
	_, err := c.UpdateProspectusURL(context.Background(), "acc-1", long)
	if err == nil {
		t.Fatal("expected length error")
	}
}
