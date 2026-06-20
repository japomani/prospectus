package slack

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Notifier struct {
	token   string
	channel string
	http    *http.Client
}

func NewNotifier() *Notifier {
	return &Notifier{
		token:   os.Getenv("SLACK_BOT_TOKEN"),
		channel: os.Getenv("SLACK_QUOTES_CHANNEL"),
		http:    &http.Client{Timeout: 10 * time.Second},
	}
}

func (n *Notifier) Enabled() bool {
	return n.token != "" && n.channel != ""
}

type notifyPayload struct {
	Channel string `json:"channel"`
	Text    string `json:"text"`
	Blocks  []any  `json:"blocks,omitempty"`
}

func (n *Notifier) QuoteReady(ctx context.Context, schoolName, webURL, pdfURL, hubspotURL string) error {
	if !n.Enabled() {
		return nil
	}
	text := fmt.Sprintf("Quote for *%s* is ready.\n• <%s|View Prospectus>", schoolName, webURL)
	if pdfURL != "" {
		text += fmt.Sprintf("\n• <%s|Download PDF>", pdfURL)
	}
	if hubspotURL != "" {
		text += fmt.Sprintf("\n• <%s|Open in HubSpot>", hubspotURL)
	}
	body := notifyPayload{Channel: n.channel, Text: text}
	b, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://slack.com/api/chat.postMessage", bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+n.token)
	req.Header.Set("Content-Type", "application/json")
	resp, err := n.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	var out struct {
		OK    bool   `json:"ok"`
		Error string `json:"error"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&out)
	if !out.OK {
		return fmt.Errorf("slack post failed: %s", out.Error)
	}
	return nil
}
