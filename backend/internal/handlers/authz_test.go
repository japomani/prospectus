package handlers

import (
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestAuthorizeMachineTokenRejectedOnWrites(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	t.Setenv("ADMIN_PASSWORD", "delphiniumadmin")
	t.Setenv("SALES_READ_TOKEN", "sales-ro-token")

	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{"authorization": "Bearer sales-ro-token"},
	}
	writes := []struct {
		method, path, id string
	}{
		{"POST", "/quotes", ""},
		{"PATCH", "/quotes/abc", "abc"},
		{"DELETE", "/quotes/abc", "abc"},
		{"POST", "/quotes/abc/pdf", "abc"},
		{"POST", "/quotes/abc/notify", "abc"},
		{"PUT", "/config", ""},
		{"POST", "/quotes/preview", ""},
		{"POST", "/quotes/form-link", ""},
	}
	for _, tc := range writes {
		status, msg := authorizeAPIRequest(tc.method, tc.path, tc.id, req)
		if status != 403 || msg != "sales token is read-only" {
			t.Fatalf("%s %s => %d %q", tc.method, tc.path, status, msg)
		}
	}
}

func TestAuthorizeMachineTokenAllowsReads(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	t.Setenv("SALES_READ_TOKEN", "sales-ro-token")
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{"authorization": "Bearer sales-ro-token"},
	}
	reads := []struct {
		method, path, id string
	}{
		{"GET", "/quotes", ""},
		{"GET", "/quotes/search", ""},
		{"GET", "/quotes/abc", "abc"},
	}
	for _, tc := range reads {
		status, msg := authorizeAPIRequest(tc.method, tc.path, tc.id, req)
		if status != 0 {
			t.Fatalf("%s %s denied: %d %q", tc.method, tc.path, status, msg)
		}
	}
}

func TestAuthorizePublicQuoteGetUnauthed(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	t.Setenv("SALES_READ_TOKEN", "sales-ro-token")
	req := events.APIGatewayV2HTTPRequest{}
	status, _ := authorizeAPIRequest("GET", "/quotes/abc", "abc", req)
	if status != 0 {
		t.Fatalf("public get should allow, got %d", status)
	}
}

func TestAuthorizeListRequiresCred(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	t.Setenv("SALES_READ_TOKEN", "sales-ro-token")
	req := events.APIGatewayV2HTTPRequest{}
	status, _ := authorizeAPIRequest("GET", "/quotes", "", req)
	if status != 401 {
		t.Fatalf("got %d", status)
	}
}