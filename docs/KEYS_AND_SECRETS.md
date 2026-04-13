# Required API Keys & Credentials

This document walks through the keys and credentials the project uses, why they are needed, where to get them, and quick setup steps.

---

## 1) MongoDB Atlas (MONGODB_URI)

Why: Stores leads, messages, and app state.

Get it:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / sign in.
3. Create a new free cluster ("Shared cluster").
4. In "Database Access" add a database user and password.
5. In "Network Access" add your IP (or 0.0.0.0/0 for quick testing).
6. Click "Connect" → "Connect your application" and copy the connection string.

Example env var:

MONGODB_URI=mongodb+srv://<USER>:<PASSWORD>@cluster0.xyz.mongodb.net/<DBNAME>?retryWrites=true&w=majority

Notes:
- Use a dedicated user for the app, don't share the password.
- Lock down IPs for production.

---

## 2) OpenAI (OPENAI_API_KEY)

Why: Generates personalized outreach messages via `/api/generate`.

Get it:
1. Visit https://platform.openai.com/
2. Sign up / sign in.
3. Go to "View API keys" and create a new key.
4. Copy it into `OPENAI_API_KEY`.

Example env var:

OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

Notes:
- Monitor usage to control cost.
- Alternatives: Azure OpenAI or a local LLM; the wrapper would need changes.

---

## 3) SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE)

Why: Sends outreach emails from `/api/send-email`.

Options:

A) Mailtrap (recommended for testing)
- Mailtrap provides a safe testing inbox so you can exercise email flows without sending real messages.
- Signup: https://mailtrap.io/
- In Mailtrap dashboard create an inbox and copy SMTP credentials.

Example env vars (Mailtrap):

SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>

B) Gmail (App Password)
- If using Gmail, create an App Password (requires 2FA): https://support.google.com/accounts/answer/185833
- SMTP host: `smtp.gmail.com` port 587 (or 465 for secure)

Example env vars (Gmail with app password):

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=youremail@gmail.com
SMTP_PASS=<app-password>

Ethereal (dev-only test):
- If no SMTP is configured, or if you set `SMTP_TEST=true`, the app will automatically create a temporary Ethereal test account and return a preview URL.
- This is used for automated dry-runs and demo flows. No real emails are sent.

Notes:
- Never commit SMTP credentials. Add them to `.env.local` and to your hosting provider's secret store for production.
- For deliverability in production use a transactional provider (SendGrid, Postmark, SES) rather than Gmail.

---

## 4) Puppeteer Runtime (PUPPETEER_EXECUTABLE_PATH)

Why: When Puppeteer is installed with skip-download or when you prefer system Chrome.

Example env var:

PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

Note: This is not a secret — it's a runtime path to the Chrome binary.

---

## 5) Optional: Google Maps / Places API

Why: Instead of scraping, use Google Places to find businesses.

Where: Google Cloud Console → Enable Places API → Create API key.
ENV suggestion: GOOGLE_MAPS_API_KEY

---

## 6) CI / Hosting Secrets

When deploying, add `MONGODB_URI`, `OPENAI_API_KEY`, `SMTP_*` and `PUPPETEER_EXECUTABLE_PATH` (if needed) to your hosting provider's environment variable / secret store (Vercel, Netlify, GitHub Actions secrets, etc.).

---

## Quick `.env.local` example (DO NOT COMMIT)

```
MONGODB_URI=mongodb+srv://USER:PASS@cluster0.xyz.mongodb.net/yourdb
OPENAI_API_KEY=sk-xxxxxxxxxxxx
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
# Mailtrap example
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=mailtrap_user
SMTP_PASS=mailtrap_pass
# Or for testing with Ethereal
# SMTP_TEST=true
```

---

If you'd like, I can:
- Produce step-by-step screenshots for each provider (I can generate a checklist with exact clicks and links), or
- Walk through creating a Mailtrap inbox and then wire it into your `.env.local` and run a dry-run send (I can perform a test using Ethereal if you prefer not to paste Mailtrap creds here).

