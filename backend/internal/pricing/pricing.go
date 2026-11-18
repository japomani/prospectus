package pricing

import (
	"fmt"
	"math"
)

type SchoolType string

const (
	SchoolOnline       SchoolType = "online"
	SchoolTraditional  SchoolType = "traditional"
	DistrictMinimum    float64    = 6000
)

type Config struct {
	PerStudent float64
	Minimum    float64
}

var PricingConfig = map[SchoolType]Config{
	SchoolOnline:      {PerStudent: 6.5, Minimum: 3900},
	SchoolTraditional: {PerStudent: 5.0, Minimum: 3000},
}

type Tier struct {
	Min, Max       int
	Start, EndRatio float64
}

var PricingTiers = []Tier{
	{120000, math.MaxInt32, 0.484375, 0.484375},
	{60000, 119999, 0.515625, 0.484375},
	{30000, 59999, 0.539063, 0.515625},
	{15000, 29999, 0.554688, 0.539063},
	{7500, 14999, 0.570313, 0.554688},
	{5000, 7499, 0.601563, 0.570313},
	{2500, 4999, 0.656250, 0.601563},
	{1500, 2499, 0.718750, 0.656250},
	{1200, 1499, 0.804688, 0.718750},
	{750, 1199, 0.914063, 0.804688},
	{600, 749, 1.0, 0.914063},
}

type Products struct {
	EngagementBuilder  bool `json:"engagementBuilder"`
	CommunityBuilder   bool `json:"communityBuilder"`
	ControlTowerUltra  bool `json:"controlTowerUltra"`
	Clever             bool `json:"clever"`
	SMS                bool `json:"sms"`
}

type CustomItem struct {
	ID         int64   `json:"id"`
	Name       string  `json:"name"`
	IsDiscount bool    `json:"isDiscount"`
	IsPercent  bool    `json:"isPercent"`
	IsOneTime  bool    `json:"isOneTime"`
	Amount     float64 `json:"amount"`
}

type QuoteInput struct {
	SchoolType  SchoolType   `json:"schoolType"`
	Students    int          `json:"students"`
	IsDistrict  bool         `json:"isDistrict"`
	IsFirstYear bool         `json:"isFirstYear"`
	Years       int          `json:"years"`
	Products    Products     `json:"products"`
	CustomItems []CustomItem `json:"customItems"`
	SMSFee      float64      `json:"smsFee"`
	CleverFee   float64      `json:"cleverFee"`
	CleverSchools int        `json:"cleverSchools"` // legacy; ignored when CleverFee is used
}

type ModulePrices struct {
	EngagementBuilder float64 `json:"engagementBuilder"`
	CommunityBuilder  float64 `json:"communityBuilder"`
	ControlTowerUltra float64 `json:"controlTowerUltra"`
	Clever            float64 `json:"clever"`
	SMS               float64 `json:"sms"`
}

type YearBreakdown struct {
	Year   int     `json:"year"`
	Amount float64 `json:"amount"`
}

type Result struct {
	ProductLicenses      map[string]float64 `json:"productLicenses"`
	ProductSubtotal      float64            `json:"productSubtotal"`
	VolumeDiscount       float64            `json:"volumeDiscount"`
	MultiProductDiscount float64            `json:"multiProductDiscount"`
	MultiYearDiscount    float64            `json:"multiYearDiscount"`
	ImplementationFee    float64            `json:"implementationFee"`
	AnnualBase           float64            `json:"annualBase"`
	AnnualTotal          float64            `json:"annualTotal"`
	GrandTotal           float64            `json:"grandTotal"`
	ListTotal            float64            `json:"listTotal"`
	TotalSavings         float64            `json:"totalSavings"`
	AnnualSavings        float64            `json:"annualSavings"`
	ModulePrices         ModulePrices       `json:"modulePrices"`
	AddOnTotal           float64            `json:"addOnTotal"`
	Years                int                `json:"years"`
	YearBreakdown        []YearBreakdown    `json:"yearBreakdown"`
}

func round2(v float64) float64 {
	return math.Round(v*100) / 100
}

// safeMul multiplies in integer cents (matches delphi-me.com calculator).
func safeMul(a, b float64) float64 {
	const factor = 100.0
	return (math.Round(a*factor) * math.Round(b*factor)) / (factor * factor)
}

func (q QuoteInput) Validate() error {
	if q.Students < 0 {
		return fmt.Errorf("students cannot be negative")
	}
	if q.Years < 1 || q.Years > 5 {
		return fmt.Errorf("years must be between 1 and 5")
	}
	return nil
}

func (q QuoteInput) basePrice() float64 {
	cfg, ok := PricingConfig[q.SchoolType]
	if !ok {
		cfg = PricingConfig[SchoolOnline]
	}
	return cfg.PerStudent
}

func (q QuoteInput) minimumCost() float64 {
	cfg, ok := PricingConfig[q.SchoolType]
	if !ok {
		cfg = PricingConfig[SchoolOnline]
	}
	return cfg.Minimum
}

func (q QuoteInput) licensePerProduct() float64 {
	raw := math.Ceil(safeMul(float64(q.Students), q.basePrice()))
	return math.Max(raw, q.minimumCost())
}

// volumeDiscountPerProduct: ceil(students × discountPerStudent), matching original calculator.
func volumeDiscountPerProduct(students int, basePrice float64) float64 {
	if students < 500 {
		return 0
	}
	for _, tier := range PricingTiers {
		if students >= tier.Min && students <= tier.Max {
			var ratio float64
			if tier.Max == math.MaxInt32 {
				ratio = tier.Start
			} else {
				progress := float64(students-tier.Min) / float64(tier.Max-tier.Min)
				ratio = tier.Start + progress*(tier.EndRatio-tier.Start)
			}
			pricePerStudent := safeMul(basePrice, ratio)
			discountPerStudent := basePrice - pricePerStudent
			return math.Ceil(safeMul(float64(students), discountPerStudent))
		}
	}
	return 0
}

func implementationFee(normalizedSubtotal float64) float64 {
	if normalizedSubtotal < 6000 {
		return 1450
	}
	if normalizedSubtotal <= 20000 {
		return 1950
	}
	return 2950
}

func multiYearDiscountRate(years int) float64 {
	switch years {
	case 2:
		return 0.025
	case 3:
		return 0.05
	case 4:
		return 0.075
	case 5:
		return 0.10
	default:
		return 0
	}
}

func activePaidModules(p Products) []string {
	var names []string
	if p.EngagementBuilder {
		names = append(names, "engagementBuilder")
	}
	if p.CommunityBuilder {
		names = append(names, "communityBuilder")
	}
	if p.ControlTowerUltra {
		names = append(names, "controlTowerUltra")
	}
	return names
}

func Calculate(q QuoteInput) (Result, error) {
	if err := q.Validate(); err != nil {
		return Result{}, err
	}

	active := activePaidModules(q.Products)
	count := len(active)
	licenseEach := 0.0
	if count > 0 {
		licenseEach = q.licensePerProduct()
	}

	licenses := map[string]float64{}
	for _, name := range active {
		licenses[name] = licenseEach
	}

	productSubtotal := safeMul(licenseEach, float64(count))
	volPerProduct := 0.0
	if count > 0 {
		volPerProduct = volumeDiscountPerProduct(q.Students, q.basePrice())
	}
	volDisc := volPerProduct * float64(count)
	afterVolume := round2(productSubtotal - volDisc)

	// Multi-product and multi-year both apply to post-volume subtotal (original order).
	multiDisc := 0.0
	if count >= 2 {
		multiDisc = math.Round(afterVolume * 0.10)
	}
	afterMulti := round2(afterVolume - multiDisc)

	normalized := 0.0
	if count > 0 {
		normalized = afterVolume / float64(count)
	}
	implementationBase := normalized
	if q.IsDistrict {
		implementationBase = math.Max(normalized, DistrictMinimum)
	}
	implFee := 0.0
	if q.IsFirstYear {
		implFee = implementationFee(implementationBase)
	}

	customTotal := 0.0
	dealCustomTotal := 0.0
	cleverFee := 0.0
	if q.Products.Clever {
		cleverFee = q.CleverFee
	}
	smsFee := 0.0
	if q.Products.SMS {
		smsFee = q.SMSFee
	}
	addOnTotal := round2(cleverFee + smsFee)

	myRate := multiYearDiscountRate(q.Years)
	// Do not use safeMul: rates like 2.5%/7.5% round half-up in cents
	// (0.025 → 0.03), inflating the discount (e.g. 7800×2.5% → 234 instead of 195).
	myDisc := math.Round(afterVolume * myRate)
	afterMultiYear := round2(afterVolume - multiDisc - myDisc)

	oneTimePercentBase := round2((afterMultiYear+addOnTotal)*float64(q.Years) + implFee)
	for _, item := range q.CustomItems {
		base := afterMulti
		if item.IsOneTime {
			base = oneTimePercentBase
		}
		val := item.Amount
		if item.IsPercent {
			val = safeMul(base, item.Amount/100)
		}
		signed := math.Abs(val)
		if item.IsDiscount {
			signed = -signed
		}
		if item.IsOneTime {
			dealCustomTotal += signed
		} else {
			customTotal += signed
		}
	}
	dealCustomTotal = round2(dealCustomTotal)

	annualBase := round2(afterMultiYear + customTotal + addOnTotal)
	annualTotal := annualBase

	listPerYear := round2(productSubtotal + addOnTotal)
	listTerm := round2(listPerYear*float64(q.Years) + implFee)
	grandTotal := round2(annualTotal*float64(q.Years) + implFee + dealCustomTotal)
	totalSavings := round2(listTerm - grandTotal)
	annualSavings := round2(totalSavings / float64(q.Years))

	perModuleAfter := 0.0
	if count > 0 {
		moduleShare := round2(afterMultiYear / float64(count))
		perModuleAfter = moduleShare
		if perModuleAfter < 0 {
			perModuleAfter = 0
		}
	}

	mp := ModulePrices{
		EngagementBuilder: 0,
		CommunityBuilder:  0,
		ControlTowerUltra: 0,
		Clever:            cleverFee,
		SMS:               smsFee,
	}
	if q.Products.EngagementBuilder {
		mp.EngagementBuilder = perModuleAfter
	}
	if q.Products.CommunityBuilder {
		mp.CommunityBuilder = perModuleAfter
	}
	if q.Products.ControlTowerUltra {
		mp.ControlTowerUltra = perModuleAfter
	}

	years := []YearBreakdown{}
	for y := 1; y <= q.Years; y++ {
		amt := annualTotal
		if y == 1 {
			amt = round2(annualTotal + implFee)
		}
		years = append(years, YearBreakdown{Year: y, Amount: amt})
	}

	return Result{
		ProductLicenses:      licenses,
		ProductSubtotal:      productSubtotal,
		VolumeDiscount:       volDisc,
		MultiProductDiscount: multiDisc,
		MultiYearDiscount:    myDisc,
		ImplementationFee:    implFee,
		AnnualBase:           annualBase,
		AnnualTotal:          annualTotal,
		GrandTotal:           grandTotal,
		ListTotal:            listPerYear,
		TotalSavings:         totalSavings,
		AnnualSavings:        annualSavings,
		ModulePrices:         mp,
		AddOnTotal:           addOnTotal,
		Years:                q.Years,
		YearBreakdown:        years,
	}, nil
}
