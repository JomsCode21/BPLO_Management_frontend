# BPLO Frontend

The BPLO frontend is the web application for the Business Permit and Licensing Office workflow. It gives business owners and authorized officers a role-based workspace for permit applications, evaluations, inspections, assessments, payments, document generation, and account management.

## Technology

- React 19, TypeScript, and Vite
- React Router and Zustand
- Axios and Socket.IO client
- Tailwind CSS, Motion, and Recharts

## Prerequisites

- Node.js 20 or newer
- npm
- The [BPLO backend](../bplo-backend/README.md) running and configured

## Getting started

1. Open a terminal in this directory.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Create a `.env` file:

   ```env
   VITE_APP_ENV=development
   VITE_API_URL=http://localhost:5000
   ```

4. Start the app:

   ```powershell
   npm run dev
   ```

Vite serves the app at `http://localhost:5173` by default. Keep this origin in the backend `CORS_ORIGINS` setting.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and create a production build in `dist/`. |
| `npm run buildcheck` | Type-check without generating a build. |
| `npm run lint` | Run ESLint. |
| `npm run preview` | Preview the production build locally. |
| `npm run test:super-admin` | Run the super-admin frontend regression checks. |

## User roles

The interface adapts to the authenticated user’s role:

| Role | Main responsibilities |
| --- | --- |
| Business owner | Apply for permits, upload requirements, track applications, and view generated documents. |
| Super admin | Manage officers, permits, form and document templates, branding, and inspection processes. |
| BPLO admin | Review applications, assess fees, route inspections, approve permits, and release documents. |
| Evaluator | Evaluate submitted applications and inspection results. |
| Inspector | Schedule and complete inspections and generate certificates. |
| Department treasurer | Maintain department fee assessments and payer records. |
| Main treasurer | Confirm and monitor payment receipts. |

## Uploads and Cloudflare R2

Profile photos, branding logos, and permit-application attachments are uploaded through the BPLO backend, which stores them in Cloudflare R2. The browser never receives R2 credentials.

The upload helper is located at `src/api/file_uploader/file_uploader.ts` and uses these backend endpoints:

| Endpoint | Purpose |
| --- | --- |
| `POST /api/uploads` | Upload a file to R2. Requires an access token. |
| `GET /api/uploads/render` | Render an uploaded file. |
| `DELETE /api/uploads` | Delete an uploaded file. Requires an access token. |

Configure R2 only in the backend `.env`; see the [backend README](../bplo-backend/README.md#environment-variables).

## Project layout

```text
src/
  api/          Backend API clients and upload helpers
  components/   Reusable UI and role-specific components
  config/       Frontend environment configuration
  guards/       Protected-route access checks
  layouts/      Application and authentication layouts
  pages/        Route-level screens organized by role
  routes/       Route definitions
  socket/       Real-time Socket.IO clients
  stores/       Zustand application state
  types/        Shared TypeScript types
  utils/        Formatting, error, upload, and workflow helpers
```

## Environment notes

`VITE_*` values are embedded into the frontend build. Do not put secrets, database credentials, JWT keys, or Cloudflare R2 credentials in this `.env` file.
