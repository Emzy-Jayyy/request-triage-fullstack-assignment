# Decisions

## Assumptions and data rules

- The provided CSV is the shared input and remains unchanged in the repository.
- `external_id`, `requester`, and `subject` must contain non-whitespace text. Empty `description` is allowed.
- `priority` is restricted to `low`, `normal`, `high`, and `urgent`. `received_at` must be a valid ISO 8601 timestamp with timezone. Invalid input is rejected rather than silently guessed.
- Blank fields are trimmed. Import errors report a reason and physical source row, including where quoted fields contain line breaks.
- `external_id` is unique. The first valid occurrence is accepted; a repeat in the same file or a later import is rejected. Reimporting does not overwrite user edits.
- Requests start as `NEW`, with no owner. The available statuses are `NEW`, `IN_PROGRESS`, and `RESOLVED`. Team members can update only status and owner; an empty owner means unassigned.
- The upload limit is 1 MiB, keeping this first version simple and preventing unexpectedly large in-memory imports.

## Architecture and trade-offs

- **React + Vite + TypeScript + Tailwind CSS** provide a small, responsive UI with typed API operations and explicit loading/error states.
- **NestJS + TypeScript** organize HTTP endpoints, input validation, import logic, and database access into distinct responsibilities.
- **Prisma 7 + SQLite** provide persistent local storage without provisioning an external database. A uniqueness constraint and transactional import logic help enforce duplicate handling consistently.
- The UI uses status filtering rather than text search; the assignment allows either. Mobile uses a modal/drawer for details, while desktop shows a side-by-side view.
- Each imported CSV row is either accepted or accompanied by a reason for rejection, rather than failing the entire file when one record is invalid.

## Known limitations

- There is no authentication, access control, deployment, audit log, pagination, or full-text search.
- The 1 MiB upload cap and in-memory CSV parsing are intended for small operational exports, not large batch-processing workloads.
- Validation is deliberately strict on timestamps and priorities; other suppliers may require configurable mappings or more permissive import policies.
- The implementation was developed beyond the assignment's requested four-hour maximum; it should not be presented as a four-hour completion.

## Next step with another hour

Add request-list pagination and a small end-to-end API test covering CSV upload, persistence, and the PATCH update flow. This would improve confidence as the dataset and API surface grow, without prioritizing cosmetic polish.
