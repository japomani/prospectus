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
	"github.com/japomani/prospectus/backend/internal/appcfg"
	"github.com/japomani/prospectus/backend/internal/hubspot"
	"github.com/japomani/prospectus/backend/internal/pdf"
	"github.com/japomani/prospectus/backend/internal/pricing"
	"github.com/japomani/prospectus/backend/internal/quotes"
	"github.com/japomani/prospectus/backend/internal/slack"
)

type API struct {
	repo      *quotes.Repository
	config    *appcfg.Repository
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
		config:  appcfg.NewRepository(ddb),
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

	// Shared prospectus / HubSpot / Copy Link / PDF render: GET one quote by id is public.
	// List, mutate, preview, HubSpot search, and config stay behind the site password.
	if !isPublicQuoteGet(method, path, id) && !apigw.Authorized(req) {
		return apigw.Error(401, "unauthorized"), nil
	}

	switch {
	case method == "GET" && path == "/auth/session":
		return a.authSession(req)
	case method == "GET" && path == "/config":
		return a.getConfig(ctx, req)
	case method == "PUT" && path == "/config":
		return a.putConfig(ctx, req)
	case method == "POST" && path == "/quotes":
		return a.createQuote(ctx, req)
	case method == "GET" && path == "/quotes":
		return a.listQuotes(ctx, req)
	case method == "POST" && path == "/quotes/preview":
		return a.previewPricing(ctx, req)
	case method == "POST" && path == "/quotes/form-link":
		return a.formLink(ctx, req)
	case method == "GET" && path == "/hubspot/companies":
		return a.searchHubspotCompanies(ctx, req)
	case method == "GET" && strings.HasPrefix(path, "/hubspot/companies/") && path != "/hubspot/companies/":
		return a.getHubspotCompany(ctx, strings.TrimPrefix(path, "/hubspot/companies/"))
	case method == "GET" && id != "" && !strings.HasPrefix(path, "/hubspot/") && !strings.HasSuffix(path, "/pdf") && !strings.HasSuffix(path, "/notify"):
		return a.getQuote(ctx, id)
	case method == "PATCH" && id != "":
		return a.updateQuote(ctx, req)
	case method == "DELETE" && id != "" && !strings.HasSuffix(path, "/pdf") && !strings.HasSuffix(path, "/notify"):
		return a.deleteQuote(ctx, id)
	case method == "POST" && id != "" && strings.HasSuffix(path, "/pdf"):
		return a.generatePdf(ctx, id)
	case method == "POST" && id != "" && strings.HasSuffix(path, "/notify"):
		return a.notifyQuote(ctx, id)
	default:
		return apigw.Error(404, "not found"), nil
	}
}

// isPublicQuoteGet reports whether this request is an unauthenticated single-quote read
// used by shared prospectus URLs (Copy Link, HubSpot delphinium_prospectus_url).
func isPublicQuoteGet(method, path, id string) bool {
	if !strings.EqualFold(method, "GET") || id == "" {
		return false
	}
	if id == "preview" || id == "form-link" {
		return false
	}
	if strings.Contains(path, "/hubspot/") {
		return false
	}
	trimmed := strings.TrimSuffix(path, "/")
	if strings.HasSuffix(trimmed, "/pdf") || strings.HasSuffix(trimmed, "/notify") {
		return false
	}
	// /quotes/{id}, optional trailing slash, optional API Gateway stage prefix.
	suffix := "/quotes/" + id
	return trimmed == suffix || strings.HasSuffix(trimmed, suffix) || trimmed == "quotes/"+id
}

func (a *API) authSession(req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	return apigw.JSON(200, map[string]any{
		"ok":    true,
		"admin": apigw.AdminAuthorized(req),
	}), nil
}

func (a *API) getConfig(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	// Any authenticated session can read live config for quote calc; writes require admin.
	_ = req
	c, err := a.config.Get(ctx)
	if err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, c), nil
}

func (a *API) putConfig(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if !apigw.AdminAuthorized(req) {
		return apigw.Error(403, "admin required"), nil
	}
	var body appcfg.Config
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	if err := appcfg.ValidatePut(body); err != nil {
		return apigw.Error(400, err.Error()), nil
	}
	if err := a.config.Put(ctx, body); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	c, err := a.config.Get(ctx)
	if err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, c), nil
}

func smsRequiredSIS(body quotes.CreateRequest) string {
	if body.Products.SMS && !body.Products.Clever {
		return "SIS integration is required when SMS texting is selected"
	}
	return ""
}

// normalizeSMSCredits enforces the 1000-credit purchase floor when SMS is on.
func normalizeSMSCredits(body *quotes.CreateRequest) {
	if body == nil || !body.Products.SMS {
		return
	}
	body.SMSCreditsPurchased = pricing.ClampSMSCreditsPurchased(body.SMSCreditsPurchased)
	if body.SMSSnapshot == nil {
		return
	}
	if v, ok := body.SMSSnapshot["creditsPurchased"]; ok {
		switch n := v.(type) {
		case float64:
			body.SMSSnapshot["creditsPurchased"] = pricing.ClampSMSCreditsPurchased(n)
		case int:
			body.SMSSnapshot["creditsPurchased"] = pricing.ClampSMSCreditsPurchased(float64(n))
		}
	}
}

func (a *API) createQuote(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	var body quotes.CreateRequest
	if err := apigw.ParseJSON(req.Body, &body); err != nil {
		return apigw.Error(400, "invalid json"), nil
	}
	if msg := smsRequiredSIS(body); msg != "" {
		return apigw.Error(400, msg), nil
	}
	normalizeSMSCredits(&body)
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
		SMSFee: body.SMSFee,
		SMSFte: body.SMSFte, SMSTeachersPerStudent: body.SMSTeachersPerStudent,
		SMSMsgsPerTeacherStudentMo: body.SMSMsgsPerTeacherStudentMo, SMSActiveMonths: body.SMSActiveMonths,
		SMSCreditsPurchased: body.SMSCreditsPurchased, SMSOverageMode: body.SMSOverageMode, SMSSnapshot: body.SMSSnapshot,
		CleverFee: body.CleverFee, CleverSchools: body.CleverSchools, Notes: body.Notes, PreparedByName: body.PreparedByName,
		PreparedByTitle: body.PreparedByTitle, PrimaryPain: body.PrimaryPain,
		PainPoint1: body.PainPoint1, PainPoint2: body.PainPoint2, PainPoint3: body.PainPoint3,
		PeerReference: body.PeerReference, TargetGoLive: body.TargetGoLive, ValidUntil: body.ValidUntil,
		IncludeFreeTrialPage: body.IncludeFreeTrialPage, IncludePilotPage: body.IncludePilotPage,
		SlackUserID: body.SlackUserID, Ref: body.Ref,
		HubspotCompanyID: body.HubspotCompanyID,
		PricingSnapshot: pr, CreatedAt: now, UpdatedAt: now,
	}
	if err := a.repo.Put(ctx, q); err != nil {
		return apigw.Error(500, err.Error()), nil
	}

	webURL := fmt.Sprintf("%s/quotes/%s", a.webBase, id)
	hsURL := a.syncHubspotCompany(ctx, q.HubspotCompanyID, webURL)

	// Optional: deal sync is off unless HUBSPOT_SYNC_DEALS=true.
	if a.hubspot.DealSyncEnabled() {
		hsNotes := fmt.Sprintf("Prospectus: %s", webURL)
		hs, _ := a.hubspot.SyncDeal(ctx, body.SchoolName, pr.GrandTotal, hsNotes)
		if hs.DealID != "" {
			q.HubspotDealID = hs.DealID
			_ = a.repo.Put(ctx, q)
			if hsURL == "" {
				hsURL = hs.DealURL
			}
		}
	}

	_ = a.slack.QuoteReady(ctx, body.SchoolName, webURL, "", hsURL)

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
	if msg := smsRequiredSIS(body); msg != "" {
		return apigw.Error(400, msg), nil
	}
	normalizeSMSCredits(&body)
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
	q.SMSFte = body.SMSFte
	q.SMSTeachersPerStudent = body.SMSTeachersPerStudent
	q.SMSMsgsPerTeacherStudentMo = body.SMSMsgsPerTeacherStudentMo
	q.SMSActiveMonths = body.SMSActiveMonths
	q.SMSCreditsPurchased = body.SMSCreditsPurchased
	q.SMSOverageMode = body.SMSOverageMode
	q.SMSSnapshot = body.SMSSnapshot
	q.CleverFee = body.CleverFee
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
	q.ValidUntil = body.ValidUntil
	q.IncludeFreeTrialPage = body.IncludeFreeTrialPage
	q.IncludePilotPage = body.IncludePilotPage
	q.HubspotCompanyID = body.HubspotCompanyID
	pr, err := pricing.Calculate(q.ToQuoteInput())
	if err != nil {
		return apigw.Error(400, err.Error()), nil
	}
	q.PricingSnapshot = pr
	q.UpdatedAt = time.Now().UTC()
	if err := a.repo.Put(ctx, q); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	webURL := fmt.Sprintf("%s/quotes/%s", a.webBase, id)
	_ = a.syncHubspotCompany(ctx, q.HubspotCompanyID, webURL)
	return apigw.JSON(200, quotes.QuoteResponse{
		Quote: q, Pricing: pr, WebURL: webURL,
	}), nil
}

func (a *API) deleteQuote(ctx context.Context, id string) (events.APIGatewayV2HTTPResponse, error) {
	if id == "" {
		return apigw.Error(400, "quote id required"), nil
	}
	if _, err := a.repo.Get(ctx, id); err != nil {
		return apigw.Error(404, err.Error()), nil
	}
	if err := a.repo.Delete(ctx, id); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, map[string]string{"status": "deleted", "quoteId": id}), nil
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
	if q.HubspotCompanyID != "" {
		hsURL = fmt.Sprintf("https://app.hubspot.com/contacts/company/%s", q.HubspotCompanyID)
	} else if q.HubspotDealID != "" {
		hsURL = fmt.Sprintf("https://app.hubspot.com/contacts/deal/%s", q.HubspotDealID)
	}
	if err := a.slack.QuoteReady(ctx, q.SchoolName, webURL, pdfURL, hsURL); err != nil {
		return apigw.Error(500, err.Error()), nil
	}
	return apigw.JSON(200, map[string]string{"status": "notified"}), nil
}

func (a *API) syncHubspotCompany(ctx context.Context, companyID, prospectusURL string) string {
	if companyID == "" || !a.hubspot.Enabled() {
		return ""
	}
	res, err := a.hubspot.UpdateCompanyProspectusUrl(ctx, companyID, prospectusURL)
	if err != nil || res.CompanyID == "" {
		return ""
	}
	return res.CompanyURL
}

func (a *API) searchHubspotCompanies(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	if !a.hubspot.Enabled() {
		return apigw.Error(503, "hubspot not configured"), nil
	}
	q := strings.TrimSpace(apigw.Query(req, "q"))
	if q == "" {
		return apigw.JSON(200, map[string]any{"results": []hubspot.Company{}}), nil
	}
	results, err := a.hubspot.SearchCompanies(ctx, q, 10)
	if err != nil {
		return apigw.Error(502, err.Error()), nil
	}
	return apigw.JSON(200, map[string]any{"results": results}), nil
}

func (a *API) getHubspotCompany(ctx context.Context, id string) (events.APIGatewayV2HTTPResponse, error) {
	if !a.hubspot.Enabled() {
		return apigw.Error(503, "hubspot not configured"), nil
	}
	id = strings.Trim(strings.TrimSpace(id), "/")
	if id == "" {
		return apigw.Error(400, "company id required"), nil
	}
	co, err := a.hubspot.GetCompany(ctx, id)
	if err != nil {
		return apigw.Error(502, err.Error()), nil
	}
	return apigw.JSON(200, co), nil
}
