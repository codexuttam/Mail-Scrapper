# Auto Client Finder + Outreach Engine — Backend Starter

This repo is a starter skeleton for the "Auto Client Finder + Outreach Engine" backend using Next.js (App Router), MongoDB, Puppeteer (scraping) and OpenAI (message generation).

What's included
- Next.js app structure with two API routes: /api/scrape and /api/generate
- MongoDB connection helper (/lib/db.js)
- OpenAI wrapper (/lib/openai.js)
- A Puppeteer-based scraper stub (/lib/scraper.js)
- Mongoose Lead model (/models/Lead.js)

Quick start

1. Copy .env.example to .env.local and set values (MONGODB_URI, OPENAI_API_KEY)
2. Install dependencies

```bash
npm install
```

3. Run in dev

```bash
npm run dev
```

API endpoints
- POST /api/scrape { "query": "cafes in Ghaziabad" }
- POST /api/generate { "name", "type", "location", "tone" }

Notes
- Puppeteer scraping of Google Maps may need extra flags / a Chromium binary on some hosts. This is a starter implementation — adjust for serverless or headless environments.
- Use the OpenAI key responsibly and watch for costs.

Puppeteer / Chromium notes
- If npm install fails while Puppeteer attempts to download Chromium (common on restricted networks), you can skip the download and use your system Chrome/Chromium.

1) Skip Chromium download during install:

```bash
PUPPETEER_SKIP_DOWNLOAD=true npm install
```

2) Install system Chrome/Chromium (Ubuntu example):

```bash
sudo apt update
sudo apt install -y chromium-browser
```

3) Set the executable path in your environment (example `.env.local`):

```
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

The scraper will use `PUPPETEER_EXECUTABLE_PATH` when present. Alternatively you can switch to `puppeteer-core` and provide the path at runtime to avoid the automatic download.

Next steps
- Add frontend UI pages (Next + Tailwind)
- Add authentication and rate limits
- Add an email sending flow with Nodemailer (or a transactional provider)
