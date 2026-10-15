# AI workflow

## Tools used

I used ChatGPT as an interactive coding assistant for architecture discussion, implementation guidance, debugging, and review preparation. I wrote and changed files in my local project, ran the commands myself, and checked behavior in the browser and terminal. Prisma-generated AI skill/reference files were present locally but are not part of the submitted application.

## Two or three useful interactions

1. **Designing the import pipeline.** I asked for guidance separating CSV parsing/row validation from persistence and HTTP handling. I applied the design using NestJS and Prisma, then checked the provided fixture and the reimport edge case against actual API responses and automated tests.
2. **Building the React workflow.** I asked for typed API functions and reusable request-list, details, editing, and import components. I confirmed that PATCH changed only requested fields, the list refreshed, and saved status/owner values survived a backend restart.
3. **Responsive UX and debugging.** I challenged an initial stacked mobile layout because selecting a request forced the user to scroll past the list. I changed it to a full-screen modal on phones, a drawer on tablets, and inline details on desktop, then checked actual behavior at mobile widths in Chrome DevTools.

## One correction or rejection

An AI-suggested responsive dialog initially failed to remain open in mobile simulation. I inspected browser pointer/touch/click events and confirmed that the button received clicks. The dialog's `onClose` handler was reacting to programmatic cleanup during React development effects. Replacing it with a user-initiated `onCancel` handler resolved the problem. I also requested background scroll locking so the page behind the modal would not move.

## Verification

- Ran backend Jest tests: **7 tests passed across 3 suites**, including malformed CSV rows and duplicate imports.
- Ran successful frontend and backend production builds and frontend ESLint checks.
- Imported the unchanged fixture into an already populated database: **0 imported / 14 rejected**. A modified copy containing one new `external_id` produced **1 imported / 13 rejected**, and the new request appeared in the list.
- Tested status and owner changes on desktop and mobile and verified persisted edits after restarting NestJS.
- Tested mobile/tablet modal interaction, scroll locking, and CSV upload at narrow viewport widths.

**Not yet independently verified:** A completely fresh clone/setup on another machine, end-to-end browser automation, production deployment, and performance with large data volumes. The project intentionally stays local-first.

**Timebox disclosure:** My active development work extended beyond the stated four-hour maximum; I am not representing it as a four-hour implementation.
