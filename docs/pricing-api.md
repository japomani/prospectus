# Pricing API

Base URL (live): `https://g6yxi9yar3.execute-api.us-east-1.amazonaws.com`  
Public quote pages: `https://prospectus.delphi-me.com/quotes/{id}`  
Legacy bookmarks: `https://dgnilygbxuhxd.cloudfront.net/quotes/{id}` — same CloudFront distribution, must keep working (no hostname redirect).

## Auth

| Credential | How to send | Access |
|---|---|---|
| Site password | `Authorization: Bearer <API_PASSWORD>` or `X-Api-Key` | Full API (except admin-only config writes) |
| Admin password | Same headers with `ADMIN_PASSWORD` | Full API + `PUT /config` |
| Sales read token | Same headers with `SALES_READ_TOKEN` | **Read-only:** `GET /quotes`, `GET /quotes/search`, `GET /quotes/{id}` |

`GET /quotes/{id}` remains public for shared prospectus links (no auth).

Machine token write attempts (create/update/delete, PDF, notify, config, preview, form-link) return **403** `sales token is read-only`.

### Sales read token storage (for Jared)

- **SSM Parameter Store (source of truth):** `/delphinium/prospectus/sales-read-token` (SecureString, region `us-east-1`)
- **Lambda env (runtime):** `SALES_READ_TOKEN` on the `ApiFunction` in stack `delphinium-prospectus`
- **SAM parameter:** `SalesReadToken` (NoEcho) — set at deploy from the SSM value

Rotate by putting a new SecureString in SSM, redeploying with that value (or updating the Lambda env), then invalidating the old token. Do not commit the raw token.

## Quote fields of note

- `contactName`, `contactEmail` — school contact; persisted on create/update
- If `contactEmail` is empty but `notes` contains an email, the API derives and persists it (including lazy backfill on get/list/search)
- Every quote payload from `GET /quotes`, `GET /quotes/{id}`, and `GET /quotes/search` includes `emailLine`:

```text
View {schoolName}'s Delphinium Prospectus (https://prospectus.delphi-me.com/quotes/{id})
```

Built from `WEB_BASE_URL` (live: `https://prospectus.delphi-me.com`). No trailing punctuation. School name is the stored `schoolName`.

## Endpoints

### `GET /quotes/search`

Auth: site, admin, or Sales read token.

Query params (all optional):

| Param | Meaning |
|---|---|
| `q` | Partial case-insensitive match on school/org name |
| `email` | Exact contact email |
| `rep` | Slack user id (`slackUserId`) |
| `createdAfter` | ISO-8601 / RFC3339 inclusive lower bound on `createdAt` |
| `createdBefore` | ISO-8601 / RFC3339 exclusive upper bound on `createdAt` |
| `limit` | Default 25, max 100 |
| `cursor` | Opaque cursor from a prior `nextCursor` |

Response:

```json
{
  "results": [
    {
      "id": "...",
      "schoolName": "...",
      "contactName": "...",
      "contactEmail": "...",
      "students": 900,
      "products": { "engagementBuilder": true, "...": false },
      "years": 1,
      "totalPrice": 10716,
      "rep": "U…",
      "createdAt": "...",
      "updatedAt": "...",
      "publicUrl": "https://prospectus.delphi-me.com/quotes/...",
      "emailLine": "View …'s Delphinium Prospectus (https://prospectus.delphi-me.com/quotes/...)"
    }
  ],
  "nextCursor": "…"
}
```

### `GET /quotes`

Auth required. Optional `?rep=`. Each item includes full quote fields plus `emailLine` and `webUrl`.

### `GET /quotes/{id}`

Public. Response includes `quote`, `pricing`, `webUrl`, optional `pdfUrl`, and `emailLine`.

### Mutations (site/admin only)

- `POST /quotes`, `PATCH /quotes/{id}`, `DELETE /quotes/{id}`
- `POST /quotes/{id}/pdf`, `POST /quotes/{id}/notify`
- `POST /quotes/preview`, `POST /quotes/form-link`
- Accept optional `contactName` / `contactEmail` on create/update bodies
