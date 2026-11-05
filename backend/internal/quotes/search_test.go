package quotes

import (
	"testing"
	"time"
)

func sampleQuotes() []Quote {
	t1 := time.Date(2026, 11, 1, 12, 0, 0, 0, time.UTC)
	t2 := time.Date(2026, 11, 2, 12, 0, 0, 0, time.UTC)
	t3 := time.Date(2026, 11, 3, 12, 0, 0, 0, time.UTC)
	return []Quote{
		{QuoteID: "a", SchoolName: "Alpha Academy", ContactEmail: "a@school.edu", SlackUserID: "U1", Students: 100, Years: 1, CreatedAt: t1, UpdatedAt: t1},
		{QuoteID: "b", SchoolName: "Beta High", ContactEmail: "b@school.edu", SlackUserID: "U2", Students: 200, Years: 2, CreatedAt: t2, UpdatedAt: t2},
		{QuoteID: "c", SchoolName: "Alpha Charter", ContactEmail: "c@school.edu", SlackUserID: "U1", Students: 300, Years: 3, CreatedAt: t3, UpdatedAt: t3},
	}
}

func TestSearchFilterQCaseInsensitive(t *testing.T) {
	page, next, err := ApplySearch(sampleQuotes(), SearchParams{Q: "alpha", Limit: 25})
	if err != nil {
		t.Fatal(err)
	}
	if next != "" {
		t.Fatalf("unexpected cursor %q", next)
	}
	if len(page) != 2 {
		t.Fatalf("got %d", len(page))
	}
	if page[0].QuoteID != "c" || page[1].QuoteID != "a" {
		t.Fatalf("order %#v %#v", page[0].QuoteID, page[1].QuoteID)
	}
}

func TestSearchFilterEmailExact(t *testing.T) {
	page, _, err := ApplySearch(sampleQuotes(), SearchParams{Email: "b@school.edu", Limit: 25})
	if err != nil {
		t.Fatal(err)
	}
	if len(page) != 1 || page[0].QuoteID != "b" {
		t.Fatalf("got %#v", page)
	}
}

func TestSearchFilterRep(t *testing.T) {
	page, _, err := ApplySearch(sampleQuotes(), SearchParams{Rep: "U1", Limit: 25})
	if err != nil {
		t.Fatal(err)
	}
	if len(page) != 2 {
		t.Fatalf("got %d", len(page))
	}
}

func TestSearchCreatedRange(t *testing.T) {
	after := time.Date(2026, 11, 1, 15, 0, 0, 0, time.UTC)
	before := time.Date(2026, 11, 3, 0, 0, 0, 0, time.UTC)
	page, _, err := ApplySearch(sampleQuotes(), SearchParams{CreatedAfter: &after, CreatedBefore: &before, Limit: 25})
	if err != nil {
		t.Fatal(err)
	}
	if len(page) != 1 || page[0].QuoteID != "b" {
		t.Fatalf("got %#v", page)
	}
}

func TestSearchPagingCursor(t *testing.T) {
	page1, next, err := ApplySearch(sampleQuotes(), SearchParams{Limit: 2})
	if err != nil {
		t.Fatal(err)
	}
	if len(page1) != 2 || next == "" {
		t.Fatalf("page1 len=%d next=%q", len(page1), next)
	}
	if page1[0].QuoteID != "c" || page1[1].QuoteID != "b" {
		t.Fatalf("page1 order %s %s", page1[0].QuoteID, page1[1].QuoteID)
	}
	page2, next2, err := ApplySearch(sampleQuotes(), SearchParams{Limit: 2, Cursor: next})
	if err != nil {
		t.Fatal(err)
	}
	if next2 != "" {
		t.Fatalf("expected end, got %q", next2)
	}
	if len(page2) != 1 || page2[0].QuoteID != "a" {
		t.Fatalf("page2 %#v", page2)
	}
}

func TestParseSearchLimit(t *testing.T) {
	if ParseSearchLimit("") != 25 {
		t.Fatal("default")
	}
	if ParseSearchLimit("100") != 100 {
		t.Fatal("max ok")
	}
	if ParseSearchLimit("101") != 100 {
		t.Fatal("clamp")
	}
	if ParseSearchLimit("0") != 25 {
		t.Fatal("invalid")
	}
}

func TestToSearchResultEmailLine(t *testing.T) {
	q := Quote{QuoteID: "id-1", SchoolName: "Pine Crest", Students: 50, Years: 1}
	q.PricingSnapshot.GrandTotal = 1234.5
	got := ToSearchResult(q, "https://prospectus.delphi-me.com")
	wantLine := "View Pine Crest's Delphinium Prospectus (https://prospectus.delphi-me.com/quotes/id-1)"
	if got.EmailLine != wantLine {
		t.Fatalf("emailLine %q", got.EmailLine)
	}
	if got.PublicURL != "https://prospectus.delphi-me.com/quotes/id-1" {
		t.Fatalf("url %q", got.PublicURL)
	}
	if got.TotalPrice != 1234.5 || got.Students != 50 {
		t.Fatalf("totals %#v", got)
	}
}
