# Braincell frontend

This directory contains the React/Vite application for Braincell. For the complete architecture, setup steps, environment variables, API reference, and deployment documentation, see the [project README](../README.md).

## Local development

1. Copy `.env.example` to `.env` and set `VITE_SERVER_URL`, `VITE_FIREBASE_API_KEY`, and `VITE_RAZORPAY_KEY_ID`.
2. Install dependencies with `npm install`.
3. Start the development server with `npm run dev`.

Run `npm run lint` for ESLint and `npm run build` for a production build.

### Windows PowerShell

Run these commands from the `frontend` directory:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Edit `.env` before starting the app and replace the copied example values with your own configuration.

### Backend and Firebase prerequisites

The frontend sends API requests to the gateway configured by `VITE_SERVER_URL`. Start the backend services and gateway before testing sign-in, conversations, or AI workflows. Also add the frontend's local development origin (normally `http://localhost:5173`) to the authorized domains in your Firebase project so Google sign-in can work locally.
