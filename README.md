# Delphinium Prospectus

Personalized sales prospectus generator for Delphinium.

## Structure

```
prospectus/
├── frontend/     React+Vite SPA (pricing calculator + 11-page prospectus)
├── backend/      Go Lambda API (quotes, pricing, HubSpot, Slack, PDF)
├── hermes/       Nous Hermes Agent skill for Slack quote workflows
└── scripts/      deploy helpers
```

## Local development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

- http://localhost:5173/pricing — calculator
- http://localhost:5173/prospectus — demo prospectus
- http://localhost:5173/prospectus?print=true — PDF export

**Print / Save PDF:** Use the floating print button (or `?print=true`). Print CSS uses `@page { margin: 0 }` for full-bleed sheet backgrounds and to leave no room for browser chrome. In Chrome’s print dialog, uncheck **Headers and footers** — CSS cannot turn that off; if left on you may still see URL, date, document title, or page numbers (e.g. 1/22).

Set `VITE_API_URL` in `frontend/.env` when backend is running.

### Backend (Go tests)

```powershell
cd backend
go test ./...
```

## AWS deploy

**Simple path (Windows):** from the repo root, run:

```powershell
.\deploy.ps1
```

Or from anywhere:

```powershell
cd C:\Users\10618071\Projects\prospectus; .\deploy.ps1
```

This detects frontend/backend changes, deploys only what changed (SAM + S3/CloudFront), then commits and pushes to GitHub. Optional flags: `-ForceAll`, `-FrontendOnly`, `-BackendOnly`, `-SkipGit`.

Unix/macOS helper (manual/guided):

```bash
./scripts/deploy.sh
```

Or fully manual:

```powershell
cd frontend; $env:VITE_API_URL='https://g6yxi9yar3.execute-api.us-east-1.amazonaws.com'; npm run build
cd ../backend; sam build; sam deploy
aws s3 sync ../frontend/dist/ s3://delphinium-prospectus-frontendbucket-wmyrnj6h9qay/ --delete
aws cloudfront create-invalidation --distribution-id E2UVEOPVDSKJ0I --paths '/*'
```

Live site: https://dgnilygbxuhxd.cloudfront.net

## Hermes skill

Copy `hermes/skills/delphinium-quotes/` to `~/.hermes/skills/` on your VPS and restart `hermes gateway`.

Set `PROSPECTUS_API_URL` and `PROSPECTUS_WEB_URL` in Hermes environment.

## Environment variables

See `.env.example`.

### HubSpot (company sync)

Quotes link to HubSpot **companies** (not deals by default).

1. Private app scopes: `crm.objects.companies.read`, `crm.objects.companies.write`
2. Create a company property with internal name `delphinium_prospectus_url` (single-line text), or set `HUBSPOT_PROSPECTUS_URL_PROPERTY` to an existing property
3. Set `HUBSPOT_ACCESS_TOKEN` (use `-` or empty to disable; search returns 503)
4. Optional: `HUBSPOT_SYNC_DEALS=true` to also create deals on save (off by default)

On quote save/update with `hubspotCompanyId`, the API PATCHes that company with the prospectus URL. If the custom property is missing, it appends the URL to the company `description`.
