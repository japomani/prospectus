package quotes

import (
	"encoding/base64"
	"fmt"
	"strconv"
	"strings"
	"time"
)

const (
	DefaultSearchLimit = 25
	MaxSearchLimit     = 100
)

// SearchParams are filters for GET /quotes/search.
type SearchParams struct {
	Q              string
	Email          string
	Rep            string
	CreatedAfter   *time.Time
	CreatedBefore  *time.Time
	Limit          int
	Cursor         string
}

// SearchResult is one row from GET /quotes/search.
type SearchResult struct {
	ID            string           `json:"id"`
	SchoolName    string           `json:"schoolName"`
	ContactName   string           `json:"contactName"`
	ContactEmail  string           `json:"contactEmail"`
	Students      int              `json:"students"`
	Products      any              `json:"products"`
	Years         int              `json:"years"`
	TotalPrice    float64          `json:"totalPrice"`
	Rep           string           `json:"rep"`
	CreatedAt     time.Time        `json:"createdAt"`
	UpdatedAt     time.Time        `json:"updatedAt"`
	PublicURL     string           `json:"publicUrl"`
	EmailLine     string           `json:"emailLine"`
}

// SearchResponse is the GET /quotes/search payload.
type SearchResponse struct {
	Results    []SearchResult `json:"results"`
	NextCursor string         `json:"nextCursor,omitempty"`
}

// ParseSearchLimit clamps limit to [1, MaxSearchLimit] with DefaultSearchLimit when unset/invalid.
func ParseSearchLimit(raw string) int {
	if strings.TrimSpace(raw) == "" {
		return DefaultSearchLimit
	}
	n, err := strconv.Atoi(strings.TrimSpace(raw))
	if err != nil || n <= 0 {
		return DefaultSearchLimit
	}
	if n > MaxSearchLimit {
		return MaxSearchLimit
	}
	return n
}

// ParseSearchTime parses an optional RFC3339 / RFC3339Nano timestamp.
func ParseSearchTime(raw string) (*time.Time, error) {
	s := strings.TrimSpace(raw)
	if s == "" {
		return nil, nil
	}
	if t, err := time.Parse(time.RFC3339Nano, s); err == nil {
		return &t, nil
	}
	t, err := time.Parse(time.RFC3339, s)
	if err != nil {
		return nil, fmt.Errorf("invalid time %q: want ISO-8601 / RFC3339", raw)
	}
	return &t, nil
}

// EncodeSearchCursor encodes a paging cursor from createdAt + quote id.
func EncodeSearchCursor(createdAt time.Time, quoteID string) string {
	raw := createdAt.UTC().Format(time.RFC3339Nano) + "|" + quoteID
	return base64.RawURLEncoding.EncodeToString([]byte(raw))
}

// DecodeSearchCursor decodes a paging cursor. Empty cursor yields zero values.
func DecodeSearchCursor(cursor string) (time.Time, string, error) {
	s := strings.TrimSpace(cursor)
	if s == "" {
		return time.Time{}, "", nil
	}
	b, err := base64.RawURLEncoding.DecodeString(s)
	if err != nil {
		return time.Time{}, "", fmt.Errorf("invalid cursor")
	}
	parts := strings.SplitN(string(b), "|", 2)
	if len(parts) != 2 || parts[1] == "" {
		return time.Time{}, "", fmt.Errorf("invalid cursor")
	}
	t, err := time.Parse(time.RFC3339Nano, parts[0])
	if err != nil {
		t, err = time.Parse(time.RFC3339, parts[0])
		if err != nil {
			return time.Time{}, "", fmt.Errorf("invalid cursor")
		}
	}
	return t, parts[1], nil
}

// MatchSearch reports whether q satisfies the search filters (cursor applied separately).
func MatchSearch(q Quote, p SearchParams) bool {
	if email := strings.TrimSpace(p.Email); email != "" {
		if !strings.EqualFold(strings.TrimSpace(q.ContactEmail), email) {
			return false
		}
	}
	if rep := strings.TrimSpace(p.Rep); rep != "" {
		if q.SlackUserID != rep {
			return false
		}
	}
	if needle := strings.TrimSpace(p.Q); needle != "" {
		name := strings.ToLower(q.SchoolName)
		if !strings.Contains(name, strings.ToLower(needle)) {
			return false
		}
	}
	if p.CreatedAfter != nil && q.CreatedAt.Before(p.CreatedAfter.UTC()) {
		return false
	}
	if p.CreatedBefore != nil && !q.CreatedAt.Before(p.CreatedBefore.UTC()) {
		return false
	}
	return true
}

// AfterCursor reports whether q sorts after the exclusive cursor (createdAt desc, quoteId desc).
func AfterCursor(q Quote, cursorAt time.Time, cursorID string) bool {
	if cursorID == "" && cursorAt.IsZero() {
		return true
	}
	cu := cursorAt.UTC()
	qu := q.CreatedAt.UTC()
	if qu.Before(cu) {
		return true
	}
	if qu.After(cu) {
		return false
	}
	return q.QuoteID < cursorID
}

// SortQuotesByCreatedDesc sorts newest-first, breaking ties by quoteId descending.
func SortQuotesByCreatedDesc(items []Quote) {
	for i := 0; i < len(items); i++ {
		for j := i + 1; j < len(items); j++ {
			a, b := items[i], items[j]
			swap := false
			if b.CreatedAt.After(a.CreatedAt) {
				swap = true
			} else if b.CreatedAt.Equal(a.CreatedAt) && b.QuoteID > a.QuoteID {
				swap = true
			}
			if swap {
				items[i], items[j] = items[j], items[i]
			}
		}
	}
}

// ToSearchResult maps a quote into a search row.
func ToSearchResult(q Quote, webBase string) SearchResult {
	total := 0.0
	if q.PricingSnapshot.GrandTotal != 0 {
		total = q.PricingSnapshot.GrandTotal
	}
	url := PublicQuoteURL(webBase, q.QuoteID)
	return SearchResult{
		ID:           q.QuoteID,
		SchoolName:   q.SchoolName,
		ContactName:  q.ContactName,
		ContactEmail: q.ContactEmail,
		Students:     q.Students,
		Products:     q.Products,
		Years:        q.Years,
		TotalPrice:   total,
		Rep:          q.SlackUserID,
		CreatedAt:    q.CreatedAt,
		UpdatedAt:    q.UpdatedAt,
		PublicURL:    url,
		EmailLine:    EmailLine(q.SchoolName, webBase, q.QuoteID),
	}
}

// ApplySearch filters, sorts, and pages quotes for SearchParams.
func ApplySearch(items []Quote, p SearchParams) (page []Quote, nextCursor string, err error) {
	limit := p.Limit
	if limit <= 0 {
		limit = DefaultSearchLimit
	}
	if limit > MaxSearchLimit {
		limit = MaxSearchLimit
	}
	cursorAt, cursorID, err := DecodeSearchCursor(p.Cursor)
	if err != nil {
		return nil, "", err
	}
	var matched []Quote
	for _, q := range items {
		if !MatchSearch(q, p) {
			continue
		}
		if !AfterCursor(q, cursorAt, cursorID) {
			continue
		}
		matched = append(matched, q)
	}
	SortQuotesByCreatedDesc(matched)
	if len(matched) > limit {
		last := matched[limit-1]
		nextCursor = EncodeSearchCursor(last.CreatedAt, last.QuoteID)
		matched = matched[:limit]
	}
	return matched, nextCursor, nil
}
