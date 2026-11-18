package quotes

import (
	"regexp"
	"strings"
)

var emailRE = regexp.MustCompile(`(?i)\b[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}\b`)

// DeriveContactEmail returns a contact email when one can be inferred from quote fields.
// Prefer an explicit ContactEmail; otherwise take the first email-shaped token in Notes.
func DeriveContactEmail(q Quote) string {
	if e := strings.TrimSpace(q.ContactEmail); e != "" {
		return e
	}
	return FirstEmailInText(q.Notes)
}

// FirstEmailInText returns the first email address found in text, or "".
func FirstEmailInText(text string) string {
	m := emailRE.FindString(text)
	return strings.TrimSpace(m)
}

// EnsureContactEmail fills ContactEmail when empty and a value can be derived.
// Returns true when the quote was modified.
func EnsureContactEmail(q *Quote) bool {
	if q == nil {
		return false
	}
	if strings.TrimSpace(q.ContactEmail) != "" {
		return false
	}
	derived := DeriveContactEmail(*q)
	if derived == "" {
		return false
	}
	q.ContactEmail = derived
	return true
}

// ApplyContactFromRequest sets contact fields from a create/update body.
// Empty body values leave existing quote values; derived email fills gaps.
func ApplyContactFromRequest(q *Quote, body CreateRequest) {
	if q == nil {
		return
	}
	if name := strings.TrimSpace(body.ContactName); name != "" {
		q.ContactName = name
	}
	if email := strings.TrimSpace(body.ContactEmail); email != "" {
		q.ContactEmail = email
	}
	EnsureContactEmail(q)
}
