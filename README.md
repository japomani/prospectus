# Delphinium Prospectus

Personalized sales prospectus generator for Delphinium.

## Structure

```
prospectus/
├── frontend/     React+Vite SPA (pricing calculator + 11-page prospectus)
├── backend/      Go Lambda API (quotes, pricing, Zoho, Slack, PDF)
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

### Zoho (account sync)

Quotes link to a Zoho CRM **Account**. There is no Prospectus module.

1. OAuth scopes: `ZohoCRM.modules.accounts.READ`, `ZohoCRM.modules.accounts.UPDATE`
2. Set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, and `ZOHO_REFRESH_TOKEN` (use `-` or empty to disable; search returns 503 and save does not call Zoho)
3. `ZOHO_ACCOUNTS_URL` defaults to `https://accounts.zoho.com`. `ZOHO_API_DOMAIN` defaults to `https://www.zohoapis.com`

On quote save/update with `zohoAccountId`, the API PUTs `{WEB_BASE_URL}/quotes/{id}` into `Accounts.Delphinium_Prospectus_URL`. Pass `ApiPassword` and `AdminPassword` at deploy time; they are not stored in `samconfig.toml`.

### Pricing API docs

See [`docs/pricing-api.md`](docs/pricing-api.md) for quote search (`GET /quotes/search`), `emailLine`, and the Sales read-only machine token (`SALES_READ_TOKEN` / SSM `/delphinium/prospectus/sales-read-token`).
