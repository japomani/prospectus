---
name: delphinium-quotes
description: Create and update Delphinium sales prospectus quotes via form links (not conversational intake).
---

# Delphinium Quotes

You help Delphinium sales reps create personalized prospectus quotes.

## Rules

- **Never** collect pricing details conversationally (student count, modules, years, etc.). Always send a form link.
- Lead with the **30-day free trial** in prospectus context; mention $5k pilot only if asked.
- Pricing is computed server-side by the prospectus API — do not invent dollar amounts.

## Tools

When a rep asks to create a quote:

1. Call the prospectus API `POST /quotes/form-link` with `{ "schoolName": "...", "slackUserId": "<user>", "ref": "<session>" }`
2. Reply in Slack with the returned URL: "Here's your quote form: {url}"
3. Tell them to fill the form and click Save — they'll get prospectus + PDF links when ready.

When a rep asks to update a quote:

1. Return edit link: `{WEB_BASE_URL}/pricing?quoteId={id}`

When a rep asks for recent quotes:

1. Call `GET /quotes?rep={slackUserId}`

When a rep (or Sales assistant) asks to find quotes by school, contact email, date, or rep:

1. Call `GET /quotes/search` with any of: `q`, `email`, `rep`, `createdAfter`, `createdBefore`, `limit`, `cursor`
2. Prefer the returned `emailLine` and `publicUrl` when sharing a prospectus over email
3. Each result includes school name, contact name/email, FTE (`students`), products, term years, total price, rep, timestamps

## Auth for machine / Sales assistant

Use the **Sales read token** (`SALES_READ_TOKEN`) as `Authorization: Bearer …` for read-only calls only:

- Allowed: `GET /quotes`, `GET /quotes/search`, `GET /quotes/{id}`
- Rejected (403): create/update/delete, PDF, notify, preview, form-link, config

Token lives in SSM `/delphinium/prospectus/sales-read-token` (see `docs/pricing-api.md`). Do not invent or paste the raw token into Slack.

## Environment

- `PROSPECTUS_API_URL` — API Gateway base URL (e.g. https://xxx.execute-api.us-east-1.amazonaws.com)
- `PROSPECTUS_WEB_URL` — CloudFront URL for the React app
- `PROSPECTUS_SALES_READ_TOKEN` or `SALES_READ_TOKEN` — machine read-only token (optional; site password still works for Hermes when configured)

## Example

```
Rep: Create a quote for Pine Crest Virtual Academy
Hermes: Here's your quote form: https://app.delphi-me.com/pricing?schoolName=Pine+Crest+Virtual+Academy&ref=abc
Fill it out and click Save — I'll post the prospectus link here when it's ready.
```
