# Request Triage

A locally runnable full-stack application for importing customer requests from CSV, reviewing them, and assigning an owner and status. Built with React, TypeScript, Vite, Tailwind CSS, NestJS, Prisma 7, and SQLite.

## Prerequisites

- Node.js 24 (developed and verified with Node 24.12.0)
- pnpm 10.33.0

The application runs locally; no hosted services are required.

## Setup

Run the following commands from the repository root in **PowerShell**:

```powershell
pnpm install
Copy-Item .\backend\.env.example .\backend\.env
pnpm --filter backend exec prisma generate
pnpm --filter backend exec prisma migrate deploy
```

If `backend/.env` already exists, **do not overwrite it**. The example file supplies a local SQLite connection string (`DATABASE_URL="file:./dev.db"`). The generated Prisma Client and the SQLite database are not committed and must be created locally. The pnpm workspace permits the `better-sqlite3` native build; if the SQLite driver fails to load, check that dependency installation completed and rebuild it with `pnpm --filter backend rebuild better-sqlite3`.

## Run

In two terminals, from the repository root:

**Terminal 1 — API**

```powershell
pnpm --filter backend start:dev
```

**Terminal 2 — web UI**

```powershell
pnpm --filter frontend dev
```

Open **http://localhost:5173**. The API listens at **http://localhost:3000/api**; Vite proxies `/api` requests to the NestJS server.

Alternatively, after adding the missing `dev` alias to the backend scripts, `pnpm dev` starts both workspace development servers.

## Using the application

1. Use **Import requests** to select a `.csv` file, such as `fixtures/requests.csv` (maximum 1 MiB).
2. Review the imported and rejected counts, including rejection reasons and source row numbers.
3. View the requests and filter by status.
4. Open a request to inspect its details, update status or assigned owner, and save.
5. Refresh or restart the API to confirm changes persist in SQLite.

On a **clean database**, the original fixture should import **10 requests and reject 4 rows**. Reimporting the same file after those 10 requests are stored should import **0** and reject **14**; previously imported requests are not overwritten. Leave `fixtures/requests.csv` unchanged.

## CSV data and rules

The CSV expects: `external_id`, `received_at`, `requester`, `subject`, `description`, `priority`.

- Reject missing or blank `external_id`, `requester`, or `subject`.
- Reject duplicate `external_id` values, whether repeated within an upload or already in the database.
- Accept empty descriptions.
- Accept priorities `low`, `normal`, `high`, `urgent`; reject unsupported values.
- Require a valid ISO 8601 timestamp with timezone for `received_at`; reject invalid timestamps.
- New requests start with status `NEW` and no owner; users can set `NEW`, `IN_PROGRESS`, or `RESOLVED` and can assign or clear an owner.
- Rejection reports identify the physical CSV source row.

See `DECISIONS.md` for trade-offs and limitations.

## Verification

From the repository root:

```powershell
pnpm --filter backend test
pnpm --filter backend build
pnpm --filter frontend build
pnpm --filter frontend lint
```

At the last recorded verification, **7 backend tests across 3 suites passed**, and frontend/backend builds and frontend lint passed. Backend tests include CSV parsing edge cases and duplicate reimport behavior using a separate temporary SQLite database.

Reproducible manual checks:

- On a clean database, import the provided fixture: expect **10 imported / 4 rejected** with source row numbers. Repeat the upload: expect **0 imported / 14 rejected** and no duplicate records.
- Import a copy with a new `external_id`, verify that one additional request is created, update its status/owner, restart the API, and verify the edits persist.
- Check the responsive details modal at narrow widths, including background scroll locking.

## Known limitations

This is a small local-first application, not a deployed production service. It has no authentication or authorization, pagination, or full-text search; status filtering satisfies the list-navigation requirement. Import size is limited to 1 MiB. See `DECISIONS.md` for suggested follow-up work.
