package handlers

import (
	"context"
	"fmt"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"

	"github.com/japomani/prospectus/backend/internal/apigw"
	"github.com/japomani/prospectus/backend/internal/hubspot"
	"github.com/japomani/prospectus/backend/internal/pdf"
	"github.com/japomani/prospectus/backend/internal/pricing"
	"github.com/japomani/prospectus/backend/internal/quotes"
	"github.com/japomani/prospectus/backend/internal/slack"
)

type API struct {
	repo      *quotes.Repository
	hubspot   *hubspot.Client
	slack     *slack.Notifier
	pdf       *pdf.Renderer
	webBase   string
}

func NewAPI() (*API, error) {
	cfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		return nil, err
	}
	ddb := dynamodb.NewFromConfig(cfg)
	s3c := s3.NewFromConfig(cfg)
	web := os.Getenv("WEB_BASE_URL")
	if web == "" {
		web = "http://localhost:5173"
	}
	return &API{
		repo:    quotes.NewRepository(ddb),
		hubspot: hubspot.NewClient(),
		slack:   slack.NewNotifier(),
		pdf:     pdf.NewRenderer(s3c),
		webBase: web,
	}, nil
}

func (a *API) Handle(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if apigw.IsOptions(req) {
		return apigw.OptionsOK(), nil
	}
	path := req.RawPath
	method := apigw.Method(req)
	id := req.PathParameters["id"]
	if id == "" {
		parts := strings.Split(strings.Trim(path, "/"), "/")
		if len(parts) >= 2 && parts[0] == "quotes" && parts[1] != "preview" && parts[1] != "form-link" {
			id = parts[1]
		}
	}

	switch {
	case method == "POST" && path == "/quotes":
		return a.createQuote(ctx, req)
	case method == "GET" && path == "/quotes":
		return a.listQuotes(ctx, req)
	case method == "POST" && path == "/quotes/preview":
		return a.previewPricing(ctx, req)
	case method == "POST" && path == "/quotes/form-link":
		return a.formLink(ctx, req)
	case method == "GET" && id != "" && !strings.HasSuffix(path, "/pdf") && !strings.HasSuffix(path, "/notify"):
		return a.getQuote(ctx, id)
	case method == "PATCH" && id != "":
		return a.updateQuote(ctx, req)
	case method == "POST" && id != "" && strings.HasSuffix(path, "/pdf"):
		return a.generatePdf(ctx, id)
	case method == "POST" && id != "" && strings.HasSuffix(path, "/notify"):
		return a.notifyQuote(ctx, id)
	default:
		return apigw.Error(404, "not found"), nil
	}
}

func (a *API) createQuote(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body quotes.CreateRequest
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	pr, err := pricing.Calculate(body.ToQuoteInput())
	if err != nil {
		return apigw.Error(400, err.Error()), nil
	}
	now := time.Now().UTC()
	id := uuid.New().String()
	q := quotes.Quote{
		QuoteID: id, QuoteName: body.QuoteName, SchoolName: body.SchoolName, SchoolType: body.SchoolType,
		Students: body.Students, IsDistrict: body.IsDistrict, IsUniversity: body.IsUniversity, IsFirstYear: body.IsFirstYear,
		Years: body.Years, PayUpfront: body.PayUpfront, YearlyPayments: body.YearlyPayments, Products: body.Products, CustomItems: body.CustomItems,
		SMSFee: body.SMSFee, CleverSchools: body.CleverSchools, Notes: body.Notes, PreparedByName: body.PreparedByName,
		PreparedByTitle: body.PreparedByTitle, PrimaryPain: body.PrimaryPain,
		PainPoint1: body.PainPoint1, PainPoint2: body.PainPoint2, PainPoint3: body.PainPoint3,
		PeerReference: body.PeerReference, TargetGoLive: body.TargetGoLive,
		IncludeFreeTrialPage: body.IncludeFreeTrialPage, IncludePilotPage: body.IncludePilotPage,
		SlackUserID: body.SlackUserID, Ref: body.Ref,
		PricingSnapshot: pr, CreatedAt: now, UpdatedAt: now,
	}
	if err := a.repo.Put(ctx, q); err != nil {
		return apigw.Error(500, err.Error()), nil
	}

	hsNotes := fmt.Sprintf("Prospectus: %s/quotes/%s", a.webBase, id)
	hs, _ := a.hubspot.SyncDeal(ctx, body.SchoolName, pr.GrandTotal, hsNotes)
	if hs.DealID != "" {
		q.HubspotDealID = hs.DealID
		_ = a.repo.Put(ctx, q)
	}

	webURL := fmt.Sprintf("%s/quotes/%s", a.webBase, id)
	_ = a.slack.QuoteReady(ctx, body.SchoolName, webURL, "", hs.DealURL)

	return apigw.JSON(201, quotes.QuoteResponse{
		Quote: q, Pricing: pr, WebURL: webURL,
	}), nil
}

func (a *API) getQuote(ctx context.Context, id string) (events.APIGatewayV2HTTPResponse, error) {
	q, err := a.repo.Get(ctx, id)
	if err != nil {
		return apigw.Error(404, err.Error()), nil
	}
	pr, _ := pricing.Calculate(q.ToQuoteInput())
	resp := quotes.QuoteResponse{
		Quote: q, Pricing: pr,
		WebURL: fmt.Sprintf("%s/quotes/%s", a.webBase, id),
	}
	if q.PdfS3Key != "" {
		if u, err := a.pdf.SignedURL(ctx, q.PdfS3Key); err == nil {
			resp.PdfURL = u
		}
	}
	return apigw.JSON(200, resp), nil
}

func (a *API) listQuotes(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	rep := apigw.Query(req, "rep")
	var (
		items []quotes.Quote
		err   error
	)
	if rep != "" {
		items, err = a.repo.ListByRep(ctx, rep, 20)
	} else {
		items, err = a.repo.ListRecent(ctx, 50)
	}
	if err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, items), nil
}

func (a *API) previewPricing(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body quotes.CreateRequest
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	pr, err := pricing.Calculate(body.ToQuoteInput())
	if err != nil {
		return apigw.Error(400, err.Error()), nil
	}
	return apigw.JSON(200, pr), nil
}

func (a *API) formLink(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body quotes.FormLinkRequest
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	params := url.Values{}
	if body.SchoolName != "" {
		params.Set("schoolName", body.SchoolName)
	}
	if body.Ref != "" {
		params.Set("ref", body.Ref)
	}
	if body.SlackUserID != "" {
		params.Set("slackUserId", body.SlackUserID)
	}
	link := fmt.Sprintf("%s/pricing?%s", a.webBase, params.Encode())
	return apigw.JSON(200, quotes.FormLinkResponse{URL: link}), nil
}

func (a *API) updateQuote(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	id := req.PathParameters["id"]
	if id == "" {
		parts := strings.Split(strings.Trim(req.RawPath, "/"), "/")
		if len(parts) >= 2 {
			id = parts[1]
		}
	}
	q, err := a.repo.Get(ctx, id)
	if err != nil {
		return apigw.Error(404, err.Error()), nil
	}
	var body quotes.CreateRequest
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	q.SchoolName = body.SchoolName
	q.QuoteName = body.QuoteName
	q.SchoolType = body.SchoolType
	q.Students = body.Students
	q.IsDistrict = body.IsDistrict
	q.IsUniversity = body.IsUniversity
	q.IsFirstYear = body.IsFirstYear
	q.Years = body.Years
	q.PayUpfront = body.PayUpfront
	q.YearlyPayments = body.YearlyPayments
	q.Products = body.Products
	q.CustomItems = body.CustomItems
	q.SMSFee = body.SMSFee
	q.CleverSchools = body.CleverSchools
	q.Notes = body.Notes
	q.PreparedByName = body.PreparedByName
	q.PreparedByTitle = body.PreparedByTitle
	q.PrimaryPain = body.PrimaryPain
	q.PainPoint1 = body.PainPoint1
	q.PainPoint2 = body.PainPoint2
	q.PainPoint3 = body.PainPoint3
	q.PeerReference = body.PeerReference
	q.TargetGoLive = body.TargetGoLive
	q.IncludeFreeTrialPage = body.IncludeFreeTrialPage
	q.IncludePilotPage = body.IncludePilotPage
	pr, err := pricing.Calculate(q.ToQuoteInput())
	if err != nil {
		return apigw.Error(400, err.Error()), nil
	}
	q.PricingSnapshot = pr
	q.UpdatedAt = time.Now().UTC()
	if err := a.repo.Put(ctx, q); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, quotes.QuoteResponse{
		Quote: q, Pricing: pr, WebURL: fmt.Sprintf("%s/quotes/%s", a.webBase, id),
	}), nil
}

func (a *API) generatePdf(ctx context.Context, id string) (events.APIGatewayV2HTTPResponse, error) {
	q, err := a.repo.Get(ctx, id)
	if err != nil {
		return apigw.Error(404, err.Error()), nil
	}
	data, err := a.pdf.Render(ctx, id)
	if err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	key, err := a.pdf.Store(ctx, id, data)
	if err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	q.PdfS3Key = key
	_ = a.repo.Put(ctx, q)
	pdfURL, _ := a.pdf.SignedURL(ctx, key)
	return apigw.JSON(200, map[string]string{"pdfS3Key": key, "pdfUrl": pdfURL}), nil
}

func (a *API) notifyQuote(ctx context.Context, id string) (events.APIGatewayV2HTTPResponse, error) {
	q, err := a.repo.Get(ctx, id)
	if err != nil {
		return apigw.Error(404, err.Error()), nil
	}
	webURL := fmt.Sprintf("%s/quotes/%s", a.webBase, id)
	pdfURL := ""
	if q.PdfS3Key != "" {
		pdfURL, _ = a.pdf.SignedURL(ctx, q.PdfS3Key)
	}
	hsURL := ""
	if q.HubspotDealID != "" {
		hsURL = fmt.Sprintf("https://app.hubspot.com/contacts/deal/%s", q.HubspotDealID)
	}
	if err := a.slack.QuoteReady(ctx, q.SchoolName, webURL, pdfURL, hsURL); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, map[string]string{"status": "notified"}), nil
}
