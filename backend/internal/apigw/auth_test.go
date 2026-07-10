package apigw

import (
	"encoding/base64"
	"testing"

	"github.com/aws/aws-lambda-go/events"
)

func TestAuthorizedBearer(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{
			"authorization": "Bearer delphinium",
		},
	}
	if !Authorized(req) {
		t.Fatal("expected bearer password to authorize")
	}
}

func TestAuthorizedApiKey(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{
			"x-api-key": "delphinium",
		},
	}
	if !Authorized(req) {
		t.Fatal("expected api key password to authorize")
	}
}

func TestAuthorizedBasic(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	cred := base64.StdEncoding.EncodeToString([]byte("delphinium:delphinium"))
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{
			"authorization": "Basic " + cred,
		},
	}
	if !Authorized(req) {
		t.Fatal("expected basic auth to authorize")
	}
}

func TestUnauthorizedBasicWrongUser(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	cred := base64.StdEncoding.EncodeToString([]byte("wrong:delphinium"))
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{
			"authorization": "Basic " + cred,
		},
	}
	if Authorized(req) {
		t.Fatal("expected wrong basic username to fail")
	}
}

func TestUnauthorizedWrongPassword(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	req := events.APIGatewayV2HTTPRequest{
		Headers: map[string]string{
			"authorization": "Bearer wrong",
		},
	}
	if Authorized(req) {
		t.Fatal("expected wrong password to fail")
	}
}

func TestUnauthorizedMissing(t *testing.T) {
	t.Setenv("API_PASSWORD", "delphinium")
	req := events.APIGatewayV2HTTPRequest{}
	if Authorized(req) {
		t.Fatal("expected missing password to fail")
	}
}
