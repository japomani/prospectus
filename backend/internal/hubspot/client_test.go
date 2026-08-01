package hubspot

import (
	"os"
	"testing"
)

func TestEnabledTreatsPlaceholderAsDisabled(t *testing.T) {
	t.Setenv("HUBSPOT_ACCESS_TOKEN", "-")
	t.Setenv("HUBSPOT_SYNC_DEALS", "")
	c := NewClient()
	if c.Enabled() {
		t.Fatal("expected placeholder token to disable client")
	}
	if c.DealSyncEnabled() {
		t.Fatal("expected deal sync off when disabled")
	}
}

func TestDealSyncDefaultsOff(t *testing.T) {
	t.Setenv("HUBSPOT_ACCESS_TOKEN", "pat-test")
	t.Setenv("HUBSPOT_SYNC_DEALS", "")
	c := NewClient()
	if !c.Enabled() {
		t.Fatal("expected client enabled")
	}
	if c.DealSyncEnabled() {
		t.Fatal("expected deal sync off by default")
	}
}

func TestDealSyncOptIn(t *testing.T) {
	t.Setenv("HUBSPOT_ACCESS_TOKEN", "pat-test")
	t.Setenv("HUBSPOT_SYNC_DEALS", "true")
	c := NewClient()
	if !c.DealSyncEnabled() {
		t.Fatal("expected deal sync on when HUBSPOT_SYNC_DEALS=true")
	}
}

func TestProspectusURLPropertyDefault(t *testing.T) {
	os.Unsetenv("HUBSPOT_PROSPECTUS_URL_PROPERTY")
	t.Setenv("HUBSPOT_ACCESS_TOKEN", "pat-test")
	c := NewClient()
	if c.ProspectusURLProperty() != "delphinium_prospectus_url" {
		t.Fatalf("got %q", c.ProspectusURLProperty())
	}
}
