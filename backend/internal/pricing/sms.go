package pricing

import "math"

const SMSCreditFloor = 1000

// MRound matches Excel MROUND for non-negative values.
func MRound(value, multiple float64) float64 {
	if multiple == 0 {
		return value
	}
	return math.Round(value/multiple) * multiple
}

func ListPerCredit(carrier, aws, segments, markup float64) float64 {
	return (carrier + aws) * segments * markup
}

// MatchPctOfList is Excel MATCH type 1: largest breakpoint <= monthlyCredits.
func MatchPctOfList(monthlyCredits float64, breakpoints []struct {
	CreditsMo float64
	PctOfList float64
}) float64 {
	if len(breakpoints) == 0 {
		return 1
	}
	// Assume ascending; copy and sort defensively
	type bp struct{ mo, pct float64 }
	rows := make([]bp, len(breakpoints))
	for i, b := range breakpoints {
		rows[i] = bp{b.CreditsMo, b.PctOfList}
	}
	for i := 0; i < len(rows); i++ {
		for j := i + 1; j < len(rows); j++ {
			if rows[j].mo < rows[i].mo {
				rows[i], rows[j] = rows[j], rows[i]
			}
		}
	}
	pct := rows[0].pct
	for _, r := range rows {
		if r.mo <= monthlyCredits {
			pct = r.pct
		} else {
			break
		}
	}
	return pct
}

type SMSVolumeBreakpoint struct {
	CreditsMo float64 `json:"creditsMo"`
	PctOfList float64 `json:"pctOfList"`
}

type SMSCalcConfig struct {
	CarrierFeePerSegment  float64
	AWSFeePerSegment      float64
	AvgSegmentsPerMessage float64
	MarkupMultiple        float64
	RoundToNearest        float64
	VolumeBreakpoints     []SMSVolumeBreakpoint
}

type SMSPurchaseResult struct {
	CreditsPurchased float64 `json:"creditsPurchased"`
	Floored          bool    `json:"floored"`
	PurchasedMo      float64 `json:"purchasedMo"`
	ListPerCredit    float64 `json:"listPerCredit"`
	PctOfList        float64 `json:"pctOfList"`
	EffectiveRate    float64 `json:"effectiveRate"`
	AnnualCreditCost float64 `json:"annualCreditCost"`
	DiscountOverFull float64 `json:"discountOverFull"`
}

func applySMSFloor(credits float64) (float64, bool) {
	n := math.Round(credits)
	if n < 0 {
		n = 0
	}
	if n < SMSCreditFloor {
		return SMSCreditFloor, true
	}
	return n, false
}

// ClampSMSCreditsPurchased keeps empty/0 as-is (recommended path); otherwise enforces the floor.
func ClampSMSCreditsPurchased(credits float64) float64 {
	if credits <= 0 {
		return credits
	}
	n, _ := applySMSFloor(credits)
	return n
}

func PriceSMSPurchase(purchasedYr, activeMonths float64, cfg SMSCalcConfig) SMSPurchaseResult {
	months := activeMonths
	if months < 1 {
		months = 10
	}
	purchased, floored := applySMSFloor(purchasedYr)
	purchasedMo := purchased / months
	list := ListPerCredit(cfg.CarrierFeePerSegment, cfg.AWSFeePerSegment, cfg.AvgSegmentsPerMessage, cfg.MarkupMultiple)

	bps := make([]struct {
		CreditsMo float64
		PctOfList float64
	}, len(cfg.VolumeBreakpoints))
	for i, b := range cfg.VolumeBreakpoints {
		bps[i].CreditsMo = b.CreditsMo
		bps[i].PctOfList = b.PctOfList
	}
	pct := MatchPctOfList(purchasedMo, bps)
	rate := list * pct
	annual := purchased * rate
	full := purchased * list
	return SMSPurchaseResult{
		CreditsPurchased: purchased,
		Floored:          floored,
		PurchasedMo:      purchasedMo,
		ListPerCredit:    list,
		PctOfList:        pct,
		EffectiveRate:    rate,
		AnnualCreditCost: annual,
		DiscountOverFull: full - annual,
	}
}
