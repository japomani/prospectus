package quotes

import (
	"time"

	"github.com/japomani/prospectus/backend/internal/pricing"
)

type Quote struct {
	QuoteID          string                `json:"quoteId" dynamodbav:"quoteId"`
	QuoteName        string                `json:"quoteName" dynamodbav:"quoteName"`
	SchoolName       string                `json:"schoolName" dynamodbav:"schoolName"`
	SchoolType       pricing.SchoolType    `json:"schoolType" dynamodbav:"schoolType"`
	Students         int                   `json:"students" dynamodbav:"students"`
	IsDistrict       bool                  `json:"isDistrict" dynamodbav:"isDistrict"`
	IsUniversity     bool                  `json:"isUniversity" dynamodbav:"isUniversity"`
	IsFirstYear      bool                  `json:"isFirstYear" dynamodbav:"isFirstYear"`
	Years            int                   `json:"years" dynamodbav:"years"`
	PayUpfront       bool                  `json:"payUpfront" dynamodbav:"payUpfront"`
	YearlyPayments   []float64             `json:"yearlyPayments,omitempty" dynamodbav:"yearlyPayments,omitempty"`
	Products         pricing.Products      `json:"products" dynamodbav:"products"`
	CustomItems      []pricing.CustomItem  `json:"customItems" dynamodbav:"customItems"`
	SMSFee           float64               `json:"smsFee" dynamodbav:"smsFee"`
	CleverSchools    int                   `json:"cleverSchools" dynamodbav:"cleverSchools"`
	Notes            string                `json:"notes" dynamodbav:"notes"`
	PreparedByName   string                `json:"preparedByName" dynamodbav:"preparedByName"`
	PreparedByTitle  string                `json:"preparedByTitle" dynamodbav:"preparedByTitle"`
	PrimaryPain      string                `json:"primaryPain" dynamodbav:"primaryPain"`
	PainPoint1       string                `json:"painPoint1" dynamodbav:"painPoint1"`
	PainPoint2       string                `json:"painPoint2" dynamodbav:"painPoint2"`
	PainPoint3       string                `json:"painPoint3" dynamodbav:"painPoint3"`
	PeerReference       string                `json:"peerReference" dynamodbav:"peerReference"`
	TargetGoLive        string                `json:"targetGoLive" dynamodbav:"targetGoLive"`
	IncludeFreeTrialPage bool                 `json:"includeFreeTrialPage" dynamodbav:"includeFreeTrialPage"`
	IncludePilotPage     bool                 `json:"includePilotPage" dynamodbav:"includePilotPage"`
	SlackUserID         string                `json:"slackUserId" dynamodbav:"slackUserId"`
	Ref              string                `json:"ref" dynamodbav:"ref"`
	PricingSnapshot  pricing.Result        `json:"pricingSnapshot" dynamodbav:"pricingSnapshot"`
	PdfS3Key         string                `json:"pdfS3Key" dynamodbav:"pdfS3Key"`
	HubspotDealID    string                `json:"hubspotDealId" dynamodbav:"hubspotDealId"`
	HubspotQuoteID   string                `json:"hubspotQuoteId" dynamodbav:"hubspotQuoteId"`
	CreatedAt        time.Time             `json:"createdAt" dynamodbav:"createdAt"`
	UpdatedAt        time.Time             `json:"updatedAt" dynamodbav:"updatedAt"`
}

type CreateRequest struct {
	QuoteName       string               `json:"quoteName"`
	SchoolName      string               `json:"schoolName"`
	SchoolType      pricing.SchoolType   `json:"schoolType"`
	Students        int                  `json:"students"`
	IsDistrict      bool                 `json:"isDistrict"`
	IsUniversity    bool                 `json:"isUniversity"`
	IsFirstYear     bool                 `json:"isFirstYear"`
	Years           int                  `json:"years"`
	PayUpfront      bool                 `json:"payUpfront"`
	YearlyPayments  []float64            `json:"yearlyPayments,omitempty"`
	Products        pricing.Products     `json:"products"`
	CustomItems     []pricing.CustomItem `json:"customItems"`
	SMSFee          float64              `json:"smsFee"`
	CleverSchools   int                  `json:"cleverSchools"`
	Notes           string               `json:"notes"`
	PreparedByName  string               `json:"preparedByName"`
	PreparedByTitle string               `json:"preparedByTitle"`
	PrimaryPain     string               `json:"primaryPain"`
	PainPoint1      string               `json:"painPoint1"`
	PainPoint2      string               `json:"painPoint2"`
	PainPoint3      string               `json:"painPoint3"`
	PeerReference       string               `json:"peerReference"`
	TargetGoLive        string               `json:"targetGoLive"`
	IncludeFreeTrialPage bool                `json:"includeFreeTrialPage"`
	IncludePilotPage     bool                `json:"includePilotPage"`
	SlackUserID         string               `json:"slackUserId"`
	Ref             string               `json:"ref"`
}

type FormLinkRequest struct {
	SchoolName  string `json:"schoolName"`
	Ref         string `json:"ref"`
	SlackUserID string `json:"slackUserId"`
}

type FormLinkResponse struct {
	URL string `json:"url"`
}

type QuoteResponse struct {
	Quote   Quote          `json:"quote"`
	Pricing pricing.Result `json:"pricing"`
	WebURL  string         `json:"webUrl"`
	PdfURL  string         `json:"pdfUrl,omitempty"`
}

func (r CreateRequest) ToQuoteInput() pricing.QuoteInput {
	return pricing.QuoteInput{
		SchoolType:  r.SchoolType,
		Students:    r.Students,
		IsDistrict:  r.IsDistrict,
		IsFirstYear: r.IsFirstYear,
		Years:       r.Years,
		Products:    r.Products,
		CustomItems: r.CustomItems,
		SMSFee:      r.SMSFee,
		CleverSchools: r.CleverSchools,
	}
}

func (q Quote) ToQuoteInput() pricing.QuoteInput {
	return pricing.QuoteInput{
		SchoolType:  q.SchoolType,
		Students:    q.Students,
		IsDistrict:  q.IsDistrict,
		IsFirstYear: q.IsFirstYear,
		Years:       q.Years,
		Products:    q.Products,
		CustomItems: q.CustomItems,
		SMSFee:      q.SMSFee,
		CleverSchools: q.CleverSchools,
	}
}
