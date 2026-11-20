# ZUNO API

Fastify backend for the ZUNO assistant. Deploy this folder as a separate Railway service (Root Directory: `/api`) when ready.

## Local setup
1. Copy `.env.example` to `.env`.
2. Fill in Supabase URL and **service-role key only on the server**.
3. Configure an OpenAI-compatible API endpoint only after verifying its free allowance. The app deliberately returns `AI_PROVIDER_NOT_CONFIGURED` until configured.
4. Run `npm install`, then `npm run dev`.

## Routes
- `GET /health`
- `GET /v1/usage` (authenticated)
- `POST /v1/chat` (authenticated, SSE streaming)

## Security notes
- Never put server secrets in frontend `VITE_*` variables.
- Do not expose the service-role key to browsers.
- The SQL migration adds isolated `ai_*` tables and atomic quota functions; it does not modify the existing social schema.
- In-memory rate limiting is a single-instance development baseline. Use a shared Redis store before scaling to multiple instances.
- Configure CAPTCHA, email OTP, image upload, sharing, admin routes, and guest quotas before public launch. These are not represented as complete by this initial API foundation.
