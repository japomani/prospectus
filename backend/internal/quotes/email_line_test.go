package quotes

import "testing"

func TestEmailLineExactFormat(t *testing.T) {
	got := EmailLine("Vprep West Virginia", "https://dgnilygbxuhxd.cloudfront.net", "87a41c44-0651-40e9-b954-dcacad9de959")
	want := "View Vprep West Virginia's Delphinium Prospectus (https://dgnilygbxuhxd.cloudfront.net/quotes/87a41c44-0651-40e9-b954-dcacad9de959)"
	if got != want {
		t.Fatalf("\ngot:  %q\nwant: %q", got, want)
	}
	if got[len(got)-1] == '.' {
		t.Fatal("emailLine must not end with punctuation")
	}
}

func TestPublicQuoteURL(t *testing.T) {
	got := PublicQuoteURL("https://dgnilygbxuhxd.cloudfront.net/", "abc")
	if got != "https://dgnilygbxuhxd.cloudfront.net/quotes/abc" {
		t.Fatalf("got %q", got)
	}
}
