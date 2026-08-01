package appcfg

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

const ConfigPK = "config"

type VolumeBreakpoint struct {
	CreditsMo float64 `json:"creditsMo" dynamodbav:"creditsMo"`
	PctOfList float64 `json:"pctOfList" dynamodbav:"pctOfList"`
}

type LicenseTier struct {
	PerStudent float64 `json:"perStudent" dynamodbav:"perStudent"`
	Minimum    float64 `json:"minimum" dynamodbav:"minimum"`
}

type LicenseConfig struct {
	Traditional      LicenseTier `json:"traditional" dynamodbav:"traditional"`
	Online           LicenseTier `json:"online" dynamodbav:"online"`
	DistrictMinimum  float64     `json:"districtMinimum" dynamodbav:"districtMinimum"`
}

type SMSConfig struct {
	CarrierFeePerSegment         float64            `json:"carrierFeePerSegment" dynamodbav:"carrierFeePerSegment"`
	AWSFeePerSegment             float64            `json:"awsFeePerSegment" dynamodbav:"awsFeePerSegment"`
	AvgSegmentsPerMessage        float64            `json:"avgSegmentsPerMessage" dynamodbav:"avgSegmentsPerMessage"`
	MarkupMultiple               float64            `json:"markupMultiple" dynamodbav:"markupMultiple"`
	AccountsServed               float64            `json:"accountsServed" dynamodbav:"accountsServed"`
	RoundToNearest               float64            `json:"roundToNearest" dynamodbav:"roundToNearest"`
	DefaultActiveMonths          float64            `json:"defaultActiveMonths" dynamodbav:"defaultActiveMonths"`
	DefaultTeachersPerStudent    float64            `json:"defaultTeachersPerStudent" dynamodbav:"defaultTeachersPerStudent"`
	DefaultMsgsPerTeacherStudent float64            `json:"defaultMsgsPerTeacherStudentMo" dynamodbav:"defaultMsgsPerTeacherStudentMo"`
	BrandRegistration            float64            `json:"brandRegistration" dynamodbav:"brandRegistration"`
	PublicProfitAuth             float64            `json:"publicProfitAuth" dynamodbav:"publicProfitAuth"`
	CampaignVetting              float64            `json:"campaignVetting" dynamodbav:"campaignVetting"`
	BrandVettingOptional         float64            `json:"brandVettingOptional" dynamodbav:"brandVettingOptional"`
	MonthlyCampaignFee           float64            `json:"monthlyCampaignFee" dynamodbav:"monthlyCampaignFee"`
	TenDlcLeasePerNumber         float64            `json:"tenDlcLeasePerNumber" dynamodbav:"tenDlcLeasePerNumber"`
	TenDlcNumbers                float64            `json:"tenDlcNumbers" dynamodbav:"tenDlcNumbers"`
	AmortizeMonths               float64            `json:"amortizeMonths" dynamodbav:"amortizeMonths"`
	VolumeBreakpoints            []VolumeBreakpoint `json:"volumeBreakpoints" dynamodbav:"volumeBreakpoints"`
}

type Config struct {
	PK        string        `json:"pk" dynamodbav:"pk"`
	License   LicenseConfig `json:"license" dynamodbav:"license"`
	SMS       SMSConfig     `json:"sms" dynamodbav:"sms"`
	UpdatedAt time.Time     `json:"updatedAt" dynamodbav:"updatedAt"`
}

func DefaultLicenseConfig() LicenseConfig {
	return LicenseConfig{
		Traditional:     LicenseTier{PerStudent: 5, Minimum: 3000},
		Online:          LicenseTier{PerStudent: 6.5, Minimum: 3900},
		DistrictMinimum: 6000,
	}
}

func DefaultSMSConfig() SMSConfig {
	return SMSConfig{
		CarrierFeePerSegment:         0.00302,
		AWSFeePerSegment:             0.00581,
		AvgSegmentsPerMessage:        1.3,
		MarkupMultiple:               3.35,
		AccountsServed:               5,
		RoundToNearest:               100,
		DefaultActiveMonths:          10,
		DefaultTeachersPerStudent:    7,
		DefaultMsgsPerTeacherStudent: 5,
		BrandRegistration:            4.5,
		PublicProfitAuth:             12.5,
		CampaignVetting:              15,
		BrandVettingOptional:         40,
		MonthlyCampaignFee:           10,
		TenDlcLeasePerNumber:         1,
		TenDlcNumbers:                50,
		AmortizeMonths:               12,
		VolumeBreakpoints: []VolumeBreakpoint{
			{0, 1},
			{5000, 0.86},
			{10000, 0.86},
			{25000, 0.74},
			{50000, 0.57},
			{100000, 0.49},
			{250000, 0.43},
			{500000, 0.43},
			{1000000, 0.43},
		},
	}
}

func DefaultConfig() Config {
	return Config{
		PK:      ConfigPK,
		License: DefaultLicenseConfig(),
		SMS:     DefaultSMSConfig(),
	}
}

type Repository struct {
	client    *dynamodb.Client
	tableName string
}

func NewRepository(client *dynamodb.Client) *Repository {
	table := os.Getenv("CONFIG_TABLE")
	if table == "" {
		table = "delphinium-config"
	}
	return &Repository{client: client, tableName: table}
}

func (r *Repository) Get(ctx context.Context) (Config, error) {
	out, err := r.client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.tableName),
		Key: map[string]types.AttributeValue{
			"pk": &types.AttributeValueMemberS{Value: ConfigPK},
		},
	})
	if err != nil {
		return Config{}, err
	}
	if out.Item == nil {
		return DefaultConfig(), nil
	}
	var c Config
	if err := attributevalue.UnmarshalMap(out.Item, &c); err != nil {
		return Config{}, err
	}
	c = mergeWithDefaults(c)
	return c, nil
}

func (r *Repository) Put(ctx context.Context, c Config) error {
	c.PK = ConfigPK
	c.UpdatedAt = time.Now().UTC()
	c = mergeWithDefaults(c)
	item, err := attributevalue.MarshalMap(c)
	if err != nil {
		return err
	}
	_, err = r.client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: aws.String(r.tableName),
		Item:      item,
	})
	return err
}

func mergeWithDefaults(c Config) Config {
	d := DefaultConfig()
	if c.PK == "" {
		c.PK = ConfigPK
	}
	if c.License.Traditional.PerStudent == 0 && c.License.Traditional.Minimum == 0 {
		c.License.Traditional = d.License.Traditional
	}
	if c.License.Online.PerStudent == 0 && c.License.Online.Minimum == 0 {
		c.License.Online = d.License.Online
	}
	if c.License.DistrictMinimum == 0 {
		c.License.DistrictMinimum = d.License.DistrictMinimum
	}
	if c.SMS.CarrierFeePerSegment == 0 && c.SMS.AWSFeePerSegment == 0 {
		c.SMS = d.SMS
	}
	if len(c.SMS.VolumeBreakpoints) == 0 {
		c.SMS.VolumeBreakpoints = d.SMS.VolumeBreakpoints
	}
	return c
}

func (r *Repository) EnsureTableName() string {
	if r.tableName == "" {
		return "delphinium-config"
	}
	return r.tableName
}

func ValidatePut(c Config) error {
	if c.SMS.MarkupMultiple <= 0 {
		return fmt.Errorf("sms markupMultiple must be positive")
	}
	if c.SMS.AvgSegmentsPerMessage <= 0 {
		return fmt.Errorf("sms avgSegmentsPerMessage must be positive")
	}
	return nil
}
