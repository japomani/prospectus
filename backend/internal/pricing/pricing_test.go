package pricing

import (
	"math"
	"testing"
)

func TestCalculate_2000Students_EB_CB_3Years(t *testing.T) {
	q := QuoteInput{
		SchoolType:  SchoolOnline,
		Students:    2000,
		IsDistrict:  false,
		IsFirstYear: true,
		Years:       3,
		Products: Products{
			EngagementBuilder: true,
			CommunityBuilder:  true,
		},
	}

	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}

	if r.ProductSubtotal != 26000 {
		t.Errorf("productSubtotal: got %v want 26000", r.ProductSubtotal)
	}
	if r.ImplementationFee != 1950 {
		t.Errorf("implementationFee: got %v want 1950", r.ImplementationFee)
	}
	if r.MultiYearDiscount <= 0 {
		t.Errorf("expected multi-year discount for 3yr term, got %v", r.MultiYearDiscount)
	}
	// With 5% multi-year at 3yr, annual should be below list-after-discounts
	if r.AnnualTotal >= 17000 {
		t.Errorf("annualTotal unexpectedly high: %v", r.AnnualTotal)
	}
	if r.GrandTotal <= 0 {
		t.Errorf("grandTotal should be positive: %v", r.GrandTotal)
	}
}

func TestMultiYearDiscount_2Years(t *testing.T) {
	q := QuoteInput{
		SchoolType: SchoolOnline, Students: 1000, Years: 2, IsFirstYear: true,
		Products: Products{EngagementBuilder: true},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.MultiYearDiscount <= 0 {
		t.Errorf("expected multi-year discount for 2yr term, got %v", r.MultiYearDiscount)
	}
	// 2yr = 2.5% of post-volume subtotal (plain round — not safeMul, which maps 0.025→0.03)
	expected := math.Round((r.ProductSubtotal - r.VolumeDiscount) * 0.025)
	if r.MultiYearDiscount != expected {
		t.Errorf("2yr discount: got %v want %v (2.5%% of post-volume subtotal)", r.MultiYearDiscount, expected)
	}
}

// Regression: CB+EB at minimum ($3900 each = $7800), 2yr, no volume.
// safeMul(7800, 0.025) wrongly yields 234; correct is 195.
func TestMultiYearDiscount_7800_2Years_NotSafeMulInflated(t *testing.T) {
	q := QuoteInput{
		SchoolType:  SchoolOnline,
		Students:    100, // below volume threshold; hits $3900 minimum per product
		IsFirstYear: true,
		Years:       2,
		Products: Products{
			EngagementBuilder: true,
			CommunityBuilder:  true,
		},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.ProductSubtotal != 7800 {
		t.Fatalf("productSubtotal: got %v want 7800", r.ProductSubtotal)
	}
	if r.VolumeDiscount != 0 {
		t.Fatalf("volumeDiscount: got %v want 0", r.VolumeDiscount)
	}
	if r.MultiProductDiscount != 780 {
		t.Errorf("multiProductDiscount: got %v want 780", r.MultiProductDiscount)
	}
	if r.MultiYearDiscount != 195 {
		t.Errorf("multiYearDiscount: got %v want 195 (2.5%% of 7800; not safeMul-inflated 234)", r.MultiYearDiscount)
	}
	// Annual = 7800 - 780 - 195 = 6825; list = 7800; savings = 975
	if r.AnnualTotal != 6825 {
		t.Errorf("annualTotal: got %v want 6825", r.AnnualTotal)
	}
	if r.AnnualSavings != 975 {
		t.Errorf("annualSavings: got %v want 975", r.AnnualSavings)
	}
}

func TestMultiYearDiscount_7_5Percent_4Years(t *testing.T) {
	q := QuoteInput{
		SchoolType: SchoolOnline, Students: 100, Years: 4, IsFirstYear: true,
		Products: Products{EngagementBuilder: true},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	// 3900 × 7.5% = 292.5 → 293; safeMul would inflate to 312 (8%)
	want := math.Round(3900 * 0.075)
	if r.MultiYearDiscount != want {
		t.Errorf("4yr discount: got %v want %v (7.5%% of 3900)", r.MultiYearDiscount, want)
	}
}

func TestMultiYearDiscountRates(t *testing.T) {
	rates := map[int]float64{1: 0, 2: 0.025, 3: 0.05, 4: 0.075, 5: 0.10}
	for years, want := range rates {
		if got := multiYearDiscountRate(years); got != want {
			t.Errorf("multiYearDiscountRate(%d) = %v, want %v", years, got, want)
		}
	}
}

func TestCalculate_70000Online_EB_CB_MatchesOriginal(t *testing.T) {
	q := QuoteInput{
		SchoolType:  SchoolOnline,
		Students:    70000,
		IsDistrict:  false,
		IsFirstYear: true,
		Years:       1,
		Products: Products{
			EngagementBuilder: true,
			CommunityBuilder:  true,
		},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.ProductSubtotal != 910000 {
		t.Errorf("productSubtotal: got %v want 910000", r.ProductSubtotal)
	}
	if r.VolumeDiscount != 446600 {
		t.Errorf("volumeDiscount: got %v want 446600", r.VolumeDiscount)
	}
	if r.MultiProductDiscount != 46340 {
		t.Errorf("multiProductDiscount: got %v want 46340", r.MultiProductDiscount)
	}
	if r.AnnualTotal != 417060 {
		t.Errorf("annualTotal: got %v want 417060", r.AnnualTotal)
	}
	if r.ImplementationFee != 2950 {
		t.Errorf("implementationFee: got %v want 2950", r.ImplementationFee)
	}
}

func TestCalculate_70000Traditional_EB_CB_VolumeThenMulti(t *testing.T) {
	q := QuoteInput{
		SchoolType:  SchoolTraditional,
		Students:    70000,
		IsDistrict:  true,
		IsFirstYear: false,
		Years:       1,
		Products: Products{
			EngagementBuilder: true,
			CommunityBuilder:  true,
		},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.ProductSubtotal != 700000 {
		t.Errorf("productSubtotal: got %v want 700000", r.ProductSubtotal)
	}
	if r.VolumeDiscount != 343000 {
		t.Errorf("volumeDiscount: got %v want 343000", r.VolumeDiscount)
	}
	afterVol := r.ProductSubtotal - r.VolumeDiscount
	wantMulti := math.Round(afterVol * 0.10)
	if r.MultiProductDiscount != wantMulti {
		t.Errorf("multiProductDiscount: got %v want %v (10%% of post-volume)", r.MultiProductDiscount, wantMulti)
	}
	wantAnnual := afterVol - wantMulti
	if r.AnnualTotal != wantAnnual {
		t.Errorf("annualTotal: got %v want %v", r.AnnualTotal, wantAnnual)
	}
	if r.ImplementationFee != 0 {
		t.Errorf("implementationFee: got %v want 0", r.ImplementationFee)
	}
}

func TestDistrictOnlyAffectsImplementationFeeNotLicenseMinimum(t *testing.T) {
	base := QuoteInput{
		SchoolType:  SchoolTraditional,
		Students:    100,
		IsDistrict:  false,
		IsFirstYear: true,
		Years:       1,
		Products: Products{
			EngagementBuilder: true,
		},
	}
	district := base
	district.IsDistrict = true

	withoutDistrict, err := Calculate(base)
	if err != nil {
		t.Fatal(err)
	}
	withDistrict, err := Calculate(district)
	if err != nil {
		t.Fatal(err)
	}

	if withoutDistrict.ProductSubtotal != 3000 {
		t.Fatalf("baseline subtotal: got %v want 3000", withoutDistrict.ProductSubtotal)
	}
	if withDistrict.ProductSubtotal != withoutDistrict.ProductSubtotal {
		t.Errorf("district should not change product subtotal: got %v want %v", withDistrict.ProductSubtotal, withoutDistrict.ProductSubtotal)
	}
	if withoutDistrict.ImplementationFee != 1450 {
		t.Fatalf("baseline implementation fee: got %v want 1450", withoutDistrict.ImplementationFee)
	}
	if withDistrict.ImplementationFee != 1950 {
		t.Errorf("district implementation fee: got %v want 1950", withDistrict.ImplementationFee)
	}
}

func TestMultiYearDiscount_5Years(t *testing.T) {
	q3 := QuoteInput{
		SchoolType: SchoolOnline, Students: 1000, Years: 3, IsFirstYear: true,
		Products: Products{EngagementBuilder: true},
	}
	q5 := q3
	q5.Years = 5

	r3, _ := Calculate(q3)
	r5, _ := Calculate(q5)

	if r5.MultiYearDiscount <= r3.MultiYearDiscount {
		t.Errorf("5yr discount %v should exceed 3yr %v", r5.MultiYearDiscount, r3.MultiYearDiscount)
	}
}

func TestCleverAddOn(t *testing.T) {
	q := QuoteInput{
		SchoolType: SchoolOnline, Students: 1000, Years: 1, IsFirstYear: true,
		Products: Products{EngagementBuilder: true, Clever: true}, CleverFee: 500,
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.ModulePrices.Clever != 500 {
		t.Errorf("clever fee: got %v want 500", r.ModulePrices.Clever)
	}

	qCustom := q
	qCustom.CleverFee = 0
	rCustom, err := Calculate(qCustom)
	if err != nil {
		t.Fatal(err)
	}
	if rCustom.ModulePrices.Clever != 0 {
		t.Errorf("custom/quote clever fee: got %v want 0", rCustom.ModulePrices.Clever)
	}
}
