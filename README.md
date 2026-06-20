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

```bash
./scripts/deploy.sh
```

Or manually:

```powershell
cd frontend; npm run build
cd ../backend; sam build; sam deploy --guided
aws s3 sync ../frontend/dist/ s3://YOUR_FRONTEND_BUCKET/ --delete
```

## Hermes skill

Copy `hermes/skills/delphinium-quotes/` to `~/.hermes/skills/` on your VPS and restart `hermes gateway`.

Set `PROSPECTUS_API_URL` and `PROSPECTUS_WEB_URL` in Hermes environment.

## Environment variables

See `.env.example`.
