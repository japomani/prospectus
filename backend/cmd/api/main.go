package main

import (
	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"

	"github.com/japomani/prospectus/backend/internal/handlers"
)

var api *handlers.API

func init() {
	var err error
	api, err = handlers.NewAPI()
	if err != nil {
		panic(err)
	}
}

func handler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return api.Handle(ctx, req)
}

func main() {
	lambda.Start(handler)
}
