# Yatrify

Yatrify is a travel app for discovering popular places in Nepal. It can run in development mode with Vite middleware, or in production mode from the built server bundle.

## Requirements

- Node.js 18+
- npm

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open the app at:

```text
http://localhost:3000
```

## Production run

Build the app and start the production server:

```bash
npm run build
npm start
```

## Optional environment variables

The app works without external services, but `GEMINI_API_KEY` unlocks AI chat responses.

Copy [.env.example](.env.example) to `.env.local` if you want to configure it locally.

## Notes

- If `GEMINI_API_KEY` is missing, chat falls back to a built-in mock response mode.

