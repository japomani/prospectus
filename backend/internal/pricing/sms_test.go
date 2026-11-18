package pricing

import "testing"

func TestListPerCredit(t *testing.T) {
	// (0.00302 + 0.00581) * 1.3 * 3.35 = 0.03845465
	got := ListPerCredit(0.00302, 0.00581, 1.3, 3.35)
	want := 0.03845465
	if mathAbs(got-want) > 1e-12 {
		t.Fatalf("listPerCredit: got %v want %v", got, want)
	}
}

func TestMRound(t *testing.T) {
	if got := MRound(70000, 100); got != 70000 {
		t.Fatalf("MRound 70000: %v", got)
	}
	if got := MRound(7050, 100); got != 7100 {
		t.Fatalf("MRound 7050: %v", got)
	}
	if got := MRound(7049, 100); got != 7000 {
		t.Fatalf("MRound 7049: %v", got)
	}
}

func TestMatchPctOfList(t *testing.T) {
	bps := []struct {
		CreditsMo float64
		PctOfList float64
	}{
		{0, 1},
		{5000, 0.86},
		{10000, 0.86},
		{25000, 0.74},
		{50000, 0.57},
		{100000, 0.49},
		{250000, 0.43},
		{500000, 0.43},
		{1000000, 0.43},
	}
	if got := MatchPctOfList(70000, bps); got != 0.57 {
		t.Fatalf("70000 mo tier: got %v want 0.57", got)
	}
	if got := MatchPctOfList(0, bps); got != 1 {
		t.Fatalf("0 mo tier: got %v", got)
	}
	if got := MatchPctOfList(4999, bps); got != 1 {
		t.Fatalf("4999 mo tier: got %v", got)
	}
	if got := MatchPctOfList(5000, bps); got != 0.86 {
		t.Fatalf("5000 mo tier: got %v", got)
	}
}

func TestPriceSMSPurchaseSample(t *testing.T) {
	cfg := SMSCalcConfig{
		CarrierFeePerSegment:  0.00302,
		AWSFeePerSegment:      0.00581,
		AvgSegmentsPerMessage: 1.3,
		MarkupMultiple:        3.35,
		RoundToNearest:        100,
		VolumeBreakpoints: []SMSVolumeBreakpoint{
			{0, 1}, {5000, 0.86}, {10000, 0.86}, {25000, 0.74},
			{50000, 0.57}, {100000, 0.49}, {250000, 0.43}, {500000, 0.43}, {1000000, 0.43},
		},
	}
	// 700000 yr / 10 mo = 70000 mo → 57% of list
	r := PriceSMSPurchase(700000, 10, cfg)
	if r.PctOfList != 0.57 {
		t.Fatalf("pct: %v", r.PctOfList)
	}
	wantRate := 0.03845465 * 0.57
	if mathAbs(r.EffectiveRate-wantRate) > 1e-10 {
		t.Fatalf("rate: got %v want %v", r.EffectiveRate, wantRate)
	}
	wantAnnual := 700000 * wantRate
	if mathAbs(r.AnnualCreditCost-wantAnnual) > 1e-6 {
		t.Fatalf("annual: got %v want %v", r.AnnualCreditCost, wantAnnual)
	}
}

func TestSMSFloor(t *testing.T) {
	cfg := SMSCalcConfig{
		CarrierFeePerSegment:  0.00302,
		AWSFeePerSegment:      0.00581,
		AvgSegmentsPerMessage: 1.3,
		MarkupMultiple:        3.35,
		VolumeBreakpoints:     []SMSVolumeBreakpoint{{0, 1}},
	}
	r := PriceSMSPurchase(500, 10, cfg)
	if r.CreditsPurchased != 1000 || !r.Floored {
		t.Fatalf("floor: %+v", r)
	}
}

func TestClampSMSCreditsPurchased(t *testing.T) {
	if got := ClampSMSCreditsPurchased(0); got != 0 {
		t.Fatalf("empty/0 should stay 0, got %v", got)
	}
	if got := ClampSMSCreditsPurchased(-10); got != -10 {
		t.Fatalf("non-positive should stay as-is for recommended path, got %v", got)
	}
	if got := ClampSMSCreditsPurchased(500); got != 1000 {
		t.Fatalf("500 should clamp to 1000, got %v", got)
	}
	if got := ClampSMSCreditsPurchased(1500); got != 1500 {
		t.Fatalf("1500 should stay 1500, got %v", got)
	}
}

func mathAbs(x float64) float64 {
	if x < 0 {
		return -x
	}
	return x
}
