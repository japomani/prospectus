package handlers

import "testing"

func TestIsPublicQuoteGet(t *testing.T) {
	cases := []struct {
		method string
		path   string
		id     string
		want   bool
	}{
		{"GET", "/quotes/5fd8e7f0-60fb-43fa-b0ad-c06be12ecd4e", "5fd8e7f0-60fb-43fa-b0ad-c06be12ecd4e", true},
		{"GET", "/quotes/abc/", "abc", true},
		{"GET", "/Prod/quotes/abc", "abc", true},
		{"GET", "quotes/abc", "abc", true},
		{"GET", "/quotes", "", false},
		{"GET", "/quotes/", "", false},
		{"GET", "/quotes/preview", "preview", false},
		{"GET", "/quotes/form-link", "form-link", false},
		{"GET", "/quotes/abc/pdf", "abc", false},
		{"GET", "/quotes/abc/notify", "abc", false},
		{"GET", "/hubspot/companies/1", "1", false},
		{"PATCH", "/quotes/abc", "abc", false},
		{"DELETE", "/quotes/abc", "abc", false},
		{"POST", "/quotes/abc/pdf", "abc", false},
	}
	for _, tc := range cases {
		got := isPublicQuoteGet(tc.method, tc.path, tc.id)
		if got != tc.want {
			t.Errorf("isPublicQuoteGet(%q, %q, %q) = %v, want %v", tc.method, tc.path, tc.id, got, tc.want)
		}
	}
}
