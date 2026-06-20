package pdf

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Renderer struct {
	prospectusBase string
	bucket         string
	s3             *s3.Client
	http           *http.Client
}

func NewRenderer(s3Client *s3.Client) *Renderer {
	base := os.Getenv("PROSPECTUS_BASE_URL")
	if base == "" {
		base = "http://localhost:5173"
	}
	bucket := os.Getenv("PDF_BUCKET")
	if bucket == "" {
		bucket = "delphinium-quote-pdfs"
	}
	return &Renderer{
		prospectusBase: base,
		bucket:         bucket,
		s3:             s3Client,
		http:           &http.Client{Timeout: 60 * time.Second},
	}
}

// Render fetches the print-ready prospectus HTML page.
// Production: swap for chromedp/rod headless Chrome Lambda layer.
func (r *Renderer) Render(ctx context.Context, quoteID string) ([]byte, error) {
	url := fmt.Sprintf("%s/quotes/%s?print=true&highlight=false", r.prospectusBase, quoteID)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	resp, err := r.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("prospectus fetch failed: %d", resp.StatusCode)
	}
	return io.ReadAll(resp.Body)
}

func (r *Renderer) Store(ctx context.Context, quoteID string, data []byte) (string, error) {
	key := fmt.Sprintf("quotes/%s.pdf", quoteID)
	_, err := r.s3.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(r.bucket),
		Key:         aws.String(key),
		Body:        bytes.NewReader(data),
		ContentType: aws.String("application/pdf"),
	})
	if err != nil {
		return "", err
	}
	return key, nil
}

func (r *Renderer) SignedURL(ctx context.Context, key string) (string, error) {
	presign := s3.NewPresignClient(r.s3)
	out, err := presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(r.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(7*24*time.Hour))
	if err != nil {
		return "", err
	}
	return out.URL, nil
}
