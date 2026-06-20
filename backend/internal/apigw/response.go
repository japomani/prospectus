package apigw

import (
	"encoding/json"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
)

func JSON(status int, body any) events.APIGatewayV2HTTPResponse {
	b, _ := json.Marshal(body)
	return events.APIGatewayV2HTTPResponse{
		StatusCode: status,
		Headers: map[string]string{
			"Content-Type":                "application/json",
			"Access-Control-Allow-Origin": "*",
		},
		Body: string(b),
	}
}

func Error(status int, msg string) events.APIGatewayV2HTTPResponse {
	return JSON(status, map[string]string{"error": msg})
}

func ParseJSON(body string, dest any) error {
	if body == "" {
		return nil
	}
	return json.Unmarshal([]byte(body), dest)
}

func Method(r events.APIGatewayV2HTTPRequest) string {
	return r.RequestContext.HTTP.Method
}

func PathParam(r events.APIGatewayV2HTTPRequest, name string) string {
	return r.PathParameters[name]
}

func Query(r events.APIGatewayV2HTTPRequest, name string) string {
	return r.QueryStringParameters[name]
}

func IsOptions(r events.APIGatewayV2HTTPRequest) bool {
	return Method(r) == http.MethodOptions
}

func OptionsOK() events.APIGatewayV2HTTPResponse {
	return events.APIGatewayV2HTTPResponse{
		StatusCode: 204,
		Headers: map[string]string{
			"Access-Control-Allow-Origin":  "*",
			"Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
		},
	}
}
