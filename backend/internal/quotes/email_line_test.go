package quotes

import "testing"

func TestEmailLineExactFormat(t *testing.T) {
	got := EmailLine("Vprep West Virginia", "https://prospectus.delphi-me.com", "87a41c44-0651-40e9-b954-dcacad9de959")
	want := "View Vprep West Virginia's Delphinium Prospectus (https://prospectus.delphi-me.com/quotes/87a41c44-0651-40e9-b954-dcacad9de959)"
	if got != want {
		t.Fatalf("\ngot:  %q\nwant: %q", got, want)
	}
	if got[len(got)-1] == '.' {
		t.Fatal("emailLine must not end with punctuation")
	}
}

func TestPublicQuoteURL(t *testing.T) {
	got := PublicQuoteURL("https://prospectus.delphi-me.com/", "abc")
	if got != "https://prospectus.delphi-me.com/quotes/abc" {
		t.Fatalf("got %q", got)
	}
}
