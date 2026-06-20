package pricing

import (
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
		Products: Products{EngagementBuilder: true, Clever: true},
	}
	r, err := Calculate(q)
	if err != nil {
		t.Fatal(err)
	}
	if r.ModulePrices.Clever != 500 {
		t.Errorf("clever fee: got %v want 500", r.ModulePrices.Clever)
	}
}
