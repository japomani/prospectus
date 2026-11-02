package apigw

import (
	"encoding/base64"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

const (
	defaultAPIPassword   = "delphinium"
	defaultAdminPassword = "delphiniumadmin"
	basicAuthUsername    = "delphinium"
)

// Credential is the kind of API credential presented on a request.
type Credential int

const (
	CredNone Credential = iota
	CredSite
	CredAdmin
	CredMachineRead
)

// ExpectedPassword returns the shared site gatekeeper password.
func ExpectedPassword() string {
	if p := strings.TrimSpace(os.Getenv("API_PASSWORD")); p != "" {
		return p
	}
	return defaultAPIPassword
}

// ExpectedAdminPassword returns the admin settings password.
func ExpectedAdminPassword() string {
	if p := strings.TrimSpace(os.Getenv("ADMIN_PASSWORD")); p != "" {
		return p
	}
	return defaultAdminPassword
}

// ExpectedSalesReadToken returns the optional machine read-only token for Sales assistants.
// Empty means the machine credential is disabled.
func ExpectedSalesReadToken() string {
	return strings.TrimSpace(os.Getenv("SALES_READ_TOKEN"))
}

// ExtractPassword reads the shared password from Authorization Bearer,
// HTTP Basic (username delphinium), or X-Api-Key.
func ExtractPassword(req events.APIGatewayV2HTTPRequest) string {
	if auth := strings.TrimSpace(headerValue(req, "authorization")); auth != "" {
		const bearer = "bearer "
		if len(auth) >= len(bearer) && strings.EqualFold(auth[:len(bearer)], bearer) {
			return strings.TrimSpace(auth[len(bearer):])
		}
		const basic = "basic "
		if len(auth) >= len(basic) && strings.EqualFold(auth[:len(basic)], basic) {
			return passwordFromBasic(strings.TrimSpace(auth[len(basic):]))
		}
		// Raw password in Authorization (no scheme).
		return auth
	}
	if key := strings.TrimSpace(headerValue(req, "x-api-key")); key != "" {
		return key
	}
	return ""
}

// ClassifyCredential identifies which credential the request presents.
// Machine read token is checked before site/admin so a dedicated token stays scoped.
func ClassifyCredential(req events.APIGatewayV2HTTPRequest) Credential {
	got := ExtractPassword(req)
	if got == "" {
		return CredNone
	}
	if tok := ExpectedSalesReadToken(); tok != "" && got == tok {
		return CredMachineRead
	}
	if got == ExpectedAdminPassword() {
		return CredAdmin
	}
	if got == ExpectedPassword() {
		return CredSite
	}
	return CredNone
}

// Authorized reports whether the request presents the site or admin password.
// Machine read tokens are not full Authorized — use ReadAuthorized or ClassifyCredential.
func Authorized(req events.APIGatewayV2HTTPRequest) bool {
	c := ClassifyCredential(req)
	return c == CredSite || c == CredAdmin
}

// ReadAuthorized reports whether the request may call read-only quote endpoints
// (site password, admin password, or Sales machine read token).
func ReadAuthorized(req events.APIGatewayV2HTTPRequest) bool {
	c := ClassifyCredential(req)
	return c == CredSite || c == CredAdmin || c == CredMachineRead
}

// MachineReadAuthorized reports whether the request presents the Sales read-only token.
func MachineReadAuthorized(req events.APIGatewayV2HTTPRequest) bool {
	return ClassifyCredential(req) == CredMachineRead
}

// AdminAuthorized reports whether the request presents the admin password.
func AdminAuthorized(req events.APIGatewayV2HTTPRequest) bool {
	return ClassifyCredential(req) == CredAdmin
}

// IsAdminPassword reports whether the given password is the admin password.
func IsAdminPassword(password string) bool {
	p := strings.TrimSpace(password)
	return p != "" && p == ExpectedAdminPassword()
}

// IsMachineReadPath reports whether method+path is allowed for the Sales read-only token.
func IsMachineReadPath(method, path string) bool {
	if !strings.EqualFold(method, "GET") {
		return false
	}
	trimmed := strings.TrimSuffix(path, "/")
	if trimmed == "/quotes" || strings.HasSuffix(trimmed, "/quotes") {
		return true
	}
	if trimmed == "/quotes/search" || strings.HasSuffix(trimmed, "/quotes/search") {
		return true
	}
	// GET /quotes/{id} — not preview/form-link/search/pdf/notify.
	suffix := trimmed
	if i := strings.LastIndex(trimmed, "/quotes/"); i >= 0 {
		suffix = trimmed[i:]
	}
	if !strings.HasPrefix(suffix, "/quotes/") {
		return false
	}
	id := strings.TrimPrefix(suffix, "/quotes/")
	if id == "" || strings.Contains(id, "/") {
		return false
	}
	switch id {
	case "preview", "form-link", "search":
		return false
	}
	return true
}

func passwordFromBasic(encoded string) string {
	raw, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return ""
	}
	user, pass, ok := strings.Cut(string(raw), ":")
	if !ok {
		return ""
	}
	if user != basicAuthUsername {
		return ""
	}
	return pass
}

func headerValue(req events.APIGatewayV2HTTPRequest, name string) string {
	if req.Headers == nil {
		return ""
	}
	if v, ok := req.Headers[name]; ok {
		return v
	}
	// API Gateway may normalize header names to lowercase already; also try Title-Case.
	for k, v := range req.Headers {
		if strings.EqualFold(k, name) {
			return v
		}
	}
	return ""
}
