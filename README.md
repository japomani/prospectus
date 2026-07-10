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
