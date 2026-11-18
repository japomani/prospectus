package quotes

import "testing"

func TestDeriveContactEmailFromNotes(t *testing.T) {
	q := Quote{Notes: "Reach Jane at jane.doe@school.edu for follow-up"}
	got := DeriveContactEmail(q)
	if got != "jane.doe@school.edu" {
		t.Fatalf("got %q", got)
	}
}

func TestEnsureContactEmailPersistsDerived(t *testing.T) {
	q := Quote{Notes: "cc: ops@delphi-me.com please"}
	if !EnsureContactEmail(&q) {
		t.Fatal("expected modification")
	}
	if q.ContactEmail != "ops@delphi-me.com" {
		t.Fatalf("got %q", q.ContactEmail)
	}
	if EnsureContactEmail(&q) {
		t.Fatal("second ensure should be no-op")
	}
}

func TestApplyContactFromRequest(t *testing.T) {
	q := Quote{Notes: "x@y.com"}
	ApplyContactFromRequest(&q, CreateRequest{ContactName: "Ada", ContactEmail: "ada@school.edu"})
	if q.ContactName != "Ada" || q.ContactEmail != "ada@school.edu" {
		t.Fatalf("got name=%q email=%q", q.ContactName, q.ContactEmail)
	}
}
