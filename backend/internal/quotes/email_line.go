package quotes

import (
	"fmt"
	"strings"
)

// PublicQuoteURL returns the shareable CloudFront prospectus URL for a quote id.
func PublicQuoteURL(webBase, quoteID string) string {
	base := strings.TrimRight(strings.TrimSpace(webBase), "/")
	id := strings.TrimSpace(quoteID)
	if base == "" || id == "" {
		return ""
	}
	return fmt.Sprintf("%s/quotes/%s", base, id)
}

// EmailLine builds the exact one-line copy used when emailing a prospectus link.
// Format: View {school name}'s Delphinium Prospectus ({public quote URL})
// No trailing punctuation.
func EmailLine(schoolName, webBase, quoteID string) string {
	school := strings.TrimSpace(schoolName)
	url := PublicQuoteURL(webBase, quoteID)
	if school == "" {
		school = "School"
	}
	if url == "" {
		return fmt.Sprintf("View %s's Delphinium Prospectus", school)
	}
	return fmt.Sprintf("View %s's Delphinium Prospectus (%s)", school, url)
}
