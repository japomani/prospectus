package apigw

import (
	"encoding/base64"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
)

const (
	defaultAPIPassword = "delphinium"
	basicAuthUsername  = "delphinium"
)

// ExpectedPassword returns the shared gatekeeper password.
func ExpectedPassword() string {
	if p := strings.TrimSpace(os.Getenv("API_PASSWORD")); p != "" {
		return p
	}
	return defaultAPIPassword
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

// Authorized reports whether the request presents the correct shared password.
func Authorized(req events.APIGatewayV2HTTPRequest) bool {
	got := ExtractPassword(req)
	want := ExpectedPassword()
	return got != "" && got == want
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
