# Full-stack assignment: Request Triage

## The situation

A small operations team receives customer requests as CSV exports. They need a simple web app to import the requests, review them, and track who is handling each one. The current process is a spreadsheet, so duplicate rows and incomplete data sometimes appear.

Build a useful first version. You may use **any language, framework, database, and AI development tools**. We are interested in your decisions and how you verify the result, not your choice of stack or the amount of code you write.

## Timebox

Spend **up to four hours** on the take-home work. Submit what you have at that point, even if some features are incomplete. You will have a separate 45-minute review conversation.

No paid service, deployment, authentication, or production-grade visual design is required. The app must run locally with instructions another developer can follow.

## Data

Use [`fixtures/requests.csv`](fixtures/requests.csv) as the shared input. The first row contains these columns:

| Column | Meaning |
| --- | --- |
| `external_id` | ID supplied by the customer system |
| `received_at` | Timestamp supplied by the customer system |
| `requester` | Name of the person making the request |
| `subject` | Short title |
| `description` | Longer text; may be empty |
| `priority` | Suggested priority from the customer system |

The file intentionally contains ordinary rows and edge cases. Do not edit the fixture to make the import succeed. You may add your own fixtures or tests.

## Required workflow

1. Import a CSV file through the app. Show a summary of imported and rejected rows. For rejected rows, give a useful reason and row number.
2. Show the imported requests in a list. A team member must be able to search the list or filter it by status.
3. Show the details of a request. A team member must be able to change its status and assign an owner. Choose sensible status values and document them.
4. Persist the data so imported requests and team edits survive restarting the app.
5. Handle duplicate `external_id` values and malformed rows deliberately. State your rules in `DECISIONS.md` and apply them consistently. At minimum, reject rows missing `external_id`, `requester`, or `subject`. For other uncertain input, make a reasonable decision and explain it.

The UI can be simple. We will value clear behavior, useful errors, and a coherent flow from CSV to storage to UI.

## What to submit

Submit a repository containing your implementation and:

- A README with exact local setup and run commands, plus any test commands.
- `DECISIONS.md`, using [`DECISIONS_TEMPLATE.md`](DECISIONS_TEMPLATE.md) if helpful. Include assumptions, tradeoffs, known limitations, and what you would do next.
- `AI_WORKFLOW.md`, using [`AI_WORKFLOW_TEMPLATE.md`](AI_WORKFLOW_TEMPLATE.md) if helpful. Tell us which AI tools or agents you used, two or three specific ways you directed them, one output you checked or corrected, and how you verified the final behavior. You do not need to submit full chat transcripts. If you did not use AI, say so and explain your workflow.
- At least two meaningful checks or tests, including one import edge case. These may be automated tests or clearly documented reproducible manual checks.

Keep the fixture in your repository. If you only finish part of the app, explain what works and what does not; a thoughtful partial solution is useful to us.

## Review conversation

Be ready to demo the main workflow, show one failure case, trace a row from import through storage to the UI, and explain your decisions. We will discuss a small change to the requirements during the conversation. You may use your usual AI tools then, too.

## How we assess it

We will assess product judgment, problem solving and correctness, full-stack execution, responsible use of AI agents, and your ability to explain and verify your work. We do not score the brand of AI tool, number of prompts, code volume, or visual polish.
