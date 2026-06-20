# Delphinium Pricing & Prospectus Tool — Cursor Handoff

## Project Overview

A pricing calculator and prospectus generator for Delphinium (edtech SaaS). Two products: **Engagement Builder** and **Community Builder**. Built in React + Vite, designed to deploy on AWS serverless.

---

## Architecture

```
React + Vite (S3 + CloudFront)
        ↕ REST/JSON
API Gateway → Lambda (Node.js)
        ↕                    ↕
DynamoDB              HubSpot API
(save quotes)         (sync deal + quote)
        ↕
S3 (PDF storage, signed URLs)
        ↑
Lambda: Puppeteer PDF generator
        ↑
Hermes agent → Slack
  - Receives "create quote for X" request
  - Sends form link back in Slack
  - Posts PDF + web link when quote is saved
```

### Key Decisions
- **No HubSpot native quotes** — custom app owns UX, syncs to HubSpot via API on save
- **Hermes sends a form link** (not conversational collection) to avoid token waste
- **Two outputs per quote**: live web page (`/quotes/:id`) + PDF (Puppeteer via `?print=true`)
- **AWS SAM** for deployment when ready
- **DynamoDB** for quote persistence and shareable links

---

## Current State: What's Built

### Frontend only (React + Vite) — no backend yet

#### Routes
| Path | Purpose |
|------|---------|
| `/pricing` | Internal fast pricing calculator |
| `/quotes/new?<params>` | Prospectus output (reads URL params) |
| `/quotes/:id` | Future: load saved quote from DynamoDB |

#### State is currently URL-encoded (btoa) — no backend yet
When "View Prospectus" is clicked, all quote data is base64-encoded into URL params and opened in a new tab. DynamoDB persistence is the next step.

---

## File Structure

```
/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── main.jsx                     # React 18 entry, BrowserRouter
    ├── App.jsx                      # Routes
    ├── context/
    │   └── QuoteContext.jsx         # Shared quote state
    ├── lib/
    │   ├── pricing.js               # All pricing logic (see below)
    │   └── encoder.js               # URL param encode/decode
    ├── pages/
    │   ├── PricingCalculator.jsx    # /pricing
    │   └── Prospectus.jsx           # /quotes/:id
    └── styles/
        ├── global.css               # App styles
        └── print.css                # Print/PDF styles (.no-print, @media print)
```

---

## Pricing Logic (`src/lib/pricing.js`)

### Config
```js
PRICING_CONFIG = {
  traditional: { perStudent: 5.00, minimum: 3000 },
  online:      { perStudent: 6.50, minimum: 3900 },
  districtMinimum: 6000,
}
```

### Calculation Order (per product, single year first)
1. `license = max(students × perStudent, minimum)`
2. Volume discount (students ≥ 500, tiered ratios — see PRICING_TIERS)
3. Sum both products → `productSubtotal`
4. Multi-product discount: 10% if both products selected
5. Implementation fee (first year only, based on **normalized** single-product subtotal):
   - `< $6,000` → $1,450
   - `$6,000–$20,000` → $1,950
   - `> $20,000` → $2,950
6. Custom line items (fixed or % of subtotal, add-on or discount)
7. Multi-year discount applied to annual total:
   - 2, 4, 5 years → 10%
   - 3 years → 5%
8. `grandTotal = annualTotal × years + implementationFee`

### Volume Discount Tiers
```js
const PRICING_TIERS = [
  { min: 120000, max: Infinity, startRatio: 0.484375, endRatio: 0.484375 },
  { min: 60000,  max: 119999,  startRatio: 0.515625, endRatio: 0.484375 },
  { min: 30000,  max: 59999,   startRatio: 0.539063, endRatio: 0.515625 },
  { min: 15000,  max: 29999,   startRatio: 0.554688, endRatio: 0.539063 },
  { min: 7500,   max: 14999,   startRatio: 0.570313, endRatio: 0.554688 },
  { min: 5000,   max: 7499,    startRatio: 0.601563, endRatio: 0.570313 },
  { min: 2500,   max: 4999,    startRatio: 0.656250, endRatio: 0.601563 },
  { min: 1500,   max: 2499,    startRatio: 0.718750, endRatio: 0.656250 },
  { min: 1200,   max: 1499,    startRatio: 0.804688, endRatio: 0.718750 },
  { min: 750,    max: 1199,    startRatio: 0.914063, endRatio: 0.804688 },
  { min: 600,    max: 749,     startRatio: 1.0,      endRatio: 0.914063 },
];
// Ratio interpolates linearly within each tier
// < 500 students = no volume discount
```

---

## QuoteContext State Shape

```js
{
  schoolName: '',
  schoolType: 'online' | 'traditional',
  students: 0,
  isDistrict: false,
  isFirstYear: true,
  years: 1,           // 1-5
  engagementBuilder: true,
  communityBuilder: false,
  notes: '',
  customItems: [
    { id: number, name: string, isDiscount: bool, isPercent: bool, amount: number }
  ]
}
```

---

## URL Encoding (`src/lib/encoder.js`)

```
?schoolName=...
&schoolType=online|traditional
&students=N
&isDistrict=0|1
&isFirstYear=0|1
&years=N
&notes=...
&products=<btoa(JSON)>      // { engagementBuilder: bool, communityBuilder: bool }
&customItems=<btoa(JSON)>   // array of custom item objects
```

---

## PDF Generation (not built yet)

The prospectus page supports `?print=true` in the URL — when present, `window.print()` fires automatically after 300ms. This is the hook for Puppeteer.

**Planned Lambda flow:**
1. Receive `quoteId`
2. Fetch quote from DynamoDB
3. Build URL: `https://app.com/quotes/:id?print=true`
4. Puppeteer renders it headlessly
5. Store PDF in S3
6. Return signed URL

**CSS classes for print:**
- `.no-print` → `display: none !important` in print mode
- `@page { margin: 1in }` already set
- Cards have `break-inside: avoid`

---

## Backend (not built yet)

### Planned API Endpoints
```
POST   /quotes          create quote → returns { id, webUrl, pdfUrl }
GET    /quotes/:id      get quote by ID
PATCH  /quotes/:id      update quote
GET    /quotes          list quotes (internal)
```

### DynamoDB Schema (proposed)
```
PK: quoteId (uuid)
SK: "QUOTE"
Attributes:
  schoolName, schoolType, students, isDistrict, isFirstYear,
  years, engagementBuilder, communityBuilder, notes,
  customItems (JSON), createdAt, updatedAt,
  pdfS3Key, hubspotDealId, hubspotQuoteId
```

### HubSpot Sync (not built yet)
On quote save → Lambda pushes to HubSpot:
- Creates/updates a **Deal** (amount = grandTotal)
- Creates a **Quote** with line items
- Attaches PDF URL to deal notes

---

## Hermes Agent Integration (future)

Hermes is a Slack-based agent. Planned flow:

```
Rep: "Create a quote for Acme School"
Hermes: "Here's your quote form: https://app.com/pricing?ref=abc123"
[Rep fills out form and submits]
Backend: saves quote, generates PDF, syncs to HubSpot
Hermes posts to Slack:
  "Quote for Acme School is ready"
  [View Prospectus] [Download PDF] [Open in HubSpot]

Rep: "Update quote #123"
Hermes: "Here's the edit link: https://app.com/pricing?quoteId=123"
```

Hermes tools needed:
- `generateFormLink(context)` → returns URL
- `notifyChannel(quoteId, pdfUrl, webUrl, hubspotUrl)`

---

## AWS Deployment Plan (not built yet)

```
frontend/   → S3 bucket + CloudFront distribution
backend/
├── handlers/
│   ├── createQuote.js
│   ├── getQuote.js
│   ├── updateQuote.js
│   ├── listQuotes.js
│   └── generatePdf.js      # Puppeteer Lambda layer
├── template.yaml            # AWS SAM
└── package.json
```

Deploy command target: `sam build && sam deploy`

---

## Next Steps (in order)

- [ ] Integrate UI from Anthropic design tool into React components
- [ ] Build backend: Lambda handlers + DynamoDB + SAM template
- [ ] Add quote save/load (replace URL-only state with API calls)
- [ ] HubSpot sync on quote save
- [ ] Puppeteer PDF Lambda
- [ ] AWS deployment (SAM)
- [ ] Hermes Slack integration

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:5173/pricing
```

Build check:
```bash
npm run build   # should complete with no errors
```
