# MILO Kanban UI

Next.js Kanban board for Milo + Moussa with durable state persisted to GitHub files:

- `kanban.md`
- `accomplishments.md`

## Features

- Two boards: MILO and MOUSSA
- Columns: Backlog, Next, Doing, Blocked, Done
- WIP limit enforcement on `Doing`
- API persistence via GitHub API (Octokit)
- Accomplishment logging when tasks move to `Done`

## Local setup

1. Copy env file:

```bash
cp .env.example .env.local
```

2. Fill required values in `.env.local`.
3. Run:

```bash
npm run dev
```

## Required environment variables

- `GITHUB_PAT` (repo write token)
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH` (default: `main`)
- `KANBAN_FILE_PATH` (default: `kanban.md`)
- `ACCOMPLISHMENTS_FILE_PATH` (default: `accomplishments.md`)

## API routes

- `GET /api/state` -> load/initialize board files from GitHub
- `POST /api/tasks` -> create a task
- `PATCH /api/tasks/:id` -> move/update a task

