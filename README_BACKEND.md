# Samvaad AI Connect Backend

Production-grade Express + React + Vite Full Stack Boilerplate

## Requirements

- Node.js >= 18
- Firebase Project
- Gemini API Key

## Environment Setup

Check `.env.example` to see which keys to configure. 
Specifically:
- `GEMINI_API_KEY`: Get this from Google AI Studio.
- `FIREBASE_SERVICE_ACCOUNT_KEY` (Optional for local testing if authenticated via gcloud, but required for Vercel / external deployments. Encode the service account JSON as a base64 string).

## Running Locally

1. `npm install`
2. `npm run dev`

This will spin up both the Vite dev server and Express API endpoints. 

API Endpoints available:
- `/api/analyze` - Parses and structures an analysis of a prospect
- `/api/outreach` - Generates personalized outreach via Gemini Flash
- `/api/response` - Analyzes sentiment and buying intent in replies
- `/api/followup` - Creates multi-channel follow-up strategies
- `/api/refine` - Adjusts tone (e.g. Founder mode)

## Architecture

This project maps the behavior of Next.js API Routes to a modular Vite + Express backend:
- `src/server/` holds the unified API layer
- `src/server/routes/` are the Express equivalents of Next.js Api Request handlers 
- `src/server/ai/` isolates GenAI prompt behavior and structured outputs
- `src/server/services/` holds singletons (Firebase Admin, Gemini SDK instance)

## Security
- `helmet` is configured
- Zod is handling all API boundaries
- All endpoints protected by `requireAuth` middleware using Firebase Auth Token verification.
