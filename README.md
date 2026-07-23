# SmartBill — Receipt & Expense Scanner

Upload or photograph a receipt, and SmartBill reads it, files the expense under the right category, and shows you where your money went — no manual entry, no spreadsheet.

![SmartBill dashboard screenshot placeholder](docs/screenshot-dashboard.png)

## Features

- **Upload or capture** — drag-and-drop a JPG/PNG/PDF, or use your device camera directly.
- **OCR extraction** — Tesseract.js reads the receipt in-browser (no API key needed) and pulls out merchant, date, total, and line items.
- **Editable review step** — every extracted field lands in a form you can correct before saving, since OCR is never 100% accurate.
- **Auto-categorization** — merchant-name keywords suggest a category (Food, Travel, Bills, Shopping, Health, Groceries, Entertainment, Other); you can always override it.
- **Dashboard** — animated monthly total, category donut chart, 6-month spend trend, and a recent-receipts feed.
- **Search & filter** — by merchant, category, and date range.
- **Budgets** — set an overall and/or per-category monthly limit, with color-coded progress bars and an over-budget alert banner.
- **Export** — download filtered receipts as CSV, or a formatted PDF report.
- **Receipt detail** — view the original image next to the editable data, delete with confirmation.
- **Polished empty/loading states** — shimmer skeletons, real empty-state messaging, no placeholder data.
- **Responsive + dark mode** — built mobile-first since most receipts get photographed on a phone.

## Tech stack

| Layer      | Choice                                   |
|------------|-------------------------------------------|
| Frontend   | React (Vite), Tailwind CSS, Framer Motion |
| Charts     | Recharts                                  |
| OCR        | Tesseract.js (client-side)                |
| Backend    | Node.js + Express (REST API)              |
| Database   | SQLite via `better-sqlite3`               |
| PDF export | jsPDF + jspdf-autotable                   |
| Icons      | lucide-react                              |

## Project structure

```
smartbill/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Navbar, UploadModal, ReceiptCard, charts helpers, etc.
│   │   ├── pages/           # Landing, Dashboard, ReceiptsList, ReceiptDetail, Budgets
│   │   ├── context/         # AppContext — receipts/budgets/summary state + toasts
│   │   └── utils/           # api.js, ocrParser.js, categories.js, pdfReport.js
│   └── index.html
├── server/                  # Express backend
│   ├── routes/              # receipts.js, budgets.js
│   ├── db/init.js           # SQLite schema + connection
│   ├── uploads/             # stored receipt images (created at runtime)
│   └── server.js
├── .env.example
├── .gitignore
└── package.json             # root scripts to run client + server together
```

## Setup

Requires Node.js 18+.

```bash
git clone <your-repo-url>
cd smartbill
npm run install:all        # installs both server/ and client/ dependencies
cp .env.example .env        # optional — defaults work out of the box
npm run dev                 # runs Express (port 5000) + Vite (port 5173) together
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` and `/uploads` to Express, so there's no CORS setup needed locally.

### Environment variables

| Variable      | Required | Default | Notes                                                                 |
|---------------|----------|---------|------------------------------------------------------------------------|
| `PORT`        | No       | `5000`  | Port the Express API listens on.                                       |
| `OCR_API_KEY` | No       | —       | Reserved for plugging in a hosted OCR provider later for higher accuracy; the app runs fully without it using Tesseract.js. |

## How the OCR pipeline works

1. Tesseract.js runs entirely in the browser against the uploaded/captured image — nothing is sent to a third party.
2. The raw text is parsed by `client/src/utils/ocrParser.js` using regex-based heuristics (documented in that file) to guess the merchant, purchase date, total amount, and line items.
3. The guess is shown in an editable form (`UploadModal.jsx`) — the user confirms or corrects it before anything is saved.
4. On save, the image and structured data are POSTed to `/api/receipts`, which stores the image on disk and the record in SQLite.

## Deployment

SmartBill is built to deploy as **one process**: in production, Express serves the built React app itself, so you don't need two separate hosts.

### Option A — single service (Render / Railway / Fly.io)

1. Push this repo to GitHub.
2. Create a new **Web Service** from the repo.
3. Build command: `npm run install:all && npm run build`
4. Start command: `npm start --prefix server` (this serves the API **and** the built client from `client/dist`)
5. Add environment variables from `.env.example` if you're overriding defaults.
6. Add a persistent disk/volume mounted at `server/uploads` and `server/data` if your host wipes the filesystem on redeploy (Render and Railway both support this) — otherwise uploaded images and the SQLite file won't survive a redeploy.

### Option B — split deploy (Vercel frontend + Render/Railway backend)

1. Deploy `server/` to Render or Railway as a Node web service (`npm install && npm start`). Note the resulting URL, e.g. `https://smartbill-api.onrender.com`.
2. Deploy `client/` to Vercel as a static Vite build.
3. In Vercel, add a rewrite so `/api/*` and `/uploads/*` proxy to your backend URL (`vercel.json`):
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://smartbill-api.onrender.com/api/:path*" },
       { "source": "/uploads/:path*", "destination": "https://smartbill-api.onrender.com/uploads/:path*" }
     ]
   }
   ```
4. Redeploy the frontend.

## Notes on the database

SQLite was chosen deliberately: it needs no separate service, ships as a single file, and comfortably handles a single-user or small-team expense tracker. If you outgrow it, `server/db/init.js` is the only file that needs to change — the routes talk to `db` through plain SQL, so swapping in Postgres later is a contained change.
