# Financial Analytics Dashboard

Full-stack assignment implementation: a JWT-secured financial analytics dashboard with interactive charts, a filterable/sortable/searchable transactions table, and a configurable CSV export — built with **React + TypeScript + MUI + Recharts** on the frontend and **Node.js + Express + TypeScript + MongoDB (Mongoose)** on the backend.

## Features

**Authentication & Security**
- JWT login/logout with bcrypt-hashed passwords
- All transaction/analytics/export endpoints require a valid Bearer token
- Rate-limited auth endpoints, helmet security headers, CORS locked to the frontend origin

**Financial Dashboard**
- Summary metrics (total revenue, expenses, net balance, transaction & pending counts)
- Revenue vs Expenses monthly trend (Recharts line chart)
- Category breakdown (donut) and status breakdown (bar)
- Transactions table with server-side pagination and sort indicators
- Multi-field filters: search, category, status, user, date range, amount range
- Debounced real-time search across all transaction fields
- Errors surface as alert chips (snackbars), per the assignment requirement

**CSV Export**
- Modal to pick exactly which columns to export (id, date, amount, category, status, user_id, user_profile)
- Export respects the dashboard's current filters and sorting
- Server-generated CSV with proper headers, escaping and ISO dates; auto-downloads in the browser

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite, MUI v5, Recharts, TanStack Query, Axios, React Router |
| Backend | Node.js, Express, TypeScript, Mongoose, jsonwebtoken, bcryptjs, helmet, express-rate-limit, @json2csv/plainjs |
| Database | MongoDB (Atlas M0 free tier in production) |

## Project Structure

```
frontend/          React SPA (deploy: Vercel)
backend/           Express API (deploy: Render)
  src/data/transactions.json   sample dataset (300 records)
postman/           Postman collection for the API
render.yaml        Render blueprint for the backend
```

## Local Setup

Prerequisites: Node 18+, MongoDB running locally (or an Atlas connection string).

```bash
# 1. Backend
cd backend
cp .env.example .env           # edit MONGODB_URI / JWT_SECRET if needed
npm install
npm run seed                   # loads 300 transactions + demo user
npm run dev                    # http://localhost:4000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Demo login: **demo@fin.com / demo1234** (created by the seed script).

Optional end-to-end check with the API running:

```bash
cd backend && npm run smoke    # exercises auth, list, filters, search, sort, summary, CSV
```

## API Documentation

Base URL: `http://localhost:4000` (or your Render URL). All routes under `/api/transactions` require `Authorization: Bearer <token>`.

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password, name? }` | `{ token, user }` (201) |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | — | `{ user }` |

### Transactions

| Method | Path | Query params |
|---|---|---|
| GET | `/api/transactions` | `page`, `limit` (≤100), `search`, `category`, `status`, `userId`, `dateFrom`, `dateTo`, `minAmount`, `maxAmount`, `sortBy`, `sortDir` |

Response: `{ items, total, page, limit, totalPages }`. Sorting accepts any of the transaction fields; invalid values fall back to `date desc`.

### Analytics

| Method | Path | Description |
|---|---|---|
| GET | `/api/transactions/summary` | `{ metrics, monthlyTrend, categoryBreakdown, statusBreakdown }` |

### CSV Export

| Method | Path | Body |
|---|---|---|
| POST | `/api/transactions/export/csv` | `{ columns: [...], search?, category?, status?, userId?, dateFrom?, dateTo?, minAmount?, maxAmount?, sortBy?, sortDir? }` |

`columns` must be a non-empty subset of `id, date, amount, category, status, user_id, user_profile`. Responds with `Content-Type: text/csv` and `Content-Disposition: attachment`, including a header row and RFC-4180 escaping. Example:

```csv
id,date,amount,category,status
1,2024-01-15T08:34:12.000Z,1500,Revenue,Paid
```

### Health

`GET /health` → `{ status: "ok" }` (no auth; used by Render health checks).

## Postman

- Collection file: [`postman/Financial-Analytics-Dashboard-API.postman_collection.json`](postman/Financial-Analytics-Dashboard-API.postman_collection.json)
- **Import:** Postman → Import → paste the raw GitHub URL of that file (or upload it).
- Set the `baseUrl` collection variable to your deployed API URL (or `http://localhost:4000` locally).
- Run **Auth → Login** first — its test script captures the JWT into the `token` variable automatically, so every other request is authenticated.
- **To publish a share link for the Google Form:** open the collection in Postman → click **Share** (top right) → **via Postman's public API Network / link** → Create public link → copy the generated `https://www.postman.com/...` URL. That link shows the full collection to reviewers without a login. (Requires a free Postman account.)

## Deployment

### 1. MongoDB Atlas (database)

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) → Build a **M0 Free** cluster.
2. **Database Access** → Add Database User (username + password, e.g. `app_user`). Store the password.
3. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)** (simplest for Render's dynamic IPs).
4. **Clusters → Connect → Drivers** → copy the SRV string, e.g.
   `mongodb+srv://app_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   Add the database name before the `?`: `...mongodb.net/financial_dashboard?retryWrites=...`

### 2. Backend on Render

1. Push this repo to GitHub (see *Git* section below).
2. Render dashboard → **New → Blueprint** → select the repo. The included `render.yaml` defines the API service (root dir `backend`, build `npm ci && npm run build`, start `npm start`, health check `/health`).
3. Fill in the two sync vars when prompted:
   - `MONGODB_URI` — your Atlas SRV string from step 1.4
   - `CLIENT_ORIGIN` — your Vercel frontend URL (add it after step 3; you can update it in Render → Environment afterwards)
4. Deploy, then verify `https://<your-api>.onrender.com/health` returns ok.
5. Seed production once (from your machine, pointing at Atlas):
   ```bash
   cd backend
   MONGODB_URI="<your atlas srv>" npm run seed
   ```

### 3. Frontend on Vercel

1. Vercel dashboard → **Add New → Project** → import the same GitHub repo.
2. Configure:
   - **Root Directory:** `frontend`
   - Framework Preset: Vite (auto-detected)
   - Build Command: `npm run build` · Output: `dist`
   - **Environment Variable:** `VITE_API_URL = https://<your-api>.onrender.com` (no trailing slash)
3. Deploy. Then set Render's `CLIENT_ORIGIN` to this Vercel URL and redeploy the API so CORS accepts the browser calls.

### 4. Verify

- Open the Vercel URL → login with `demo@fin.com / demo1234` → charts, table, filters, sort, search all live.
- Export CSV with a couple of columns and confirm the download.
- Run the Postman collection against the deployed `baseUrl`.

## Git: push to GitHub

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
git branch -M main
git push -u origin main
```

## Google Form submission checklist

Paste these links into the form:

| Form field | Value |
|---|---|
| Deployed application (frontend) | `https://<your-app>.vercel.app` |
| Deployed API / base URL | `https://<your-api>.onrender.com` (health: `/health`) |
| GitHub repository | `https://github.com/<your-username>/<repo-name>` |
| Postman collection link | GitHub file URL of `postman/Financial-Analytics-Dashboard-API.postman_collection.json` — or the public Postman share link from the section above |

## Notes

- `sortBy`/`sortDir`, pagination, search and filters are all **server-side** — the table stays fast and consistent for large datasets.
- Mongo indexes on `date`, `amount`, `user_id`, and `(category, status)` keep filter/sort queries efficient.
- Free-tier Render services spin down after inactivity; the first request after a nap may take ~30s (cold start) — worth mentioning to reviewers.
