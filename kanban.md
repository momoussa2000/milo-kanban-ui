# Kanban

Last updated: 2026-02-25
WIP limit: max 3 items in Doing per board.
Session rule: mandatory update after every request/session.

## A) MILO Kanban (tasks Milo executes)

### Backlog
- [M-007] Build weekly health adherence tracker (training + back/ankle-safe notes + sleep consistency) — Owner: MILO — Lane: Health — Priority: P1 — Due: TBD
- [M-008] Build family admin planning template to reduce communication friction — Owner: MILO — Lane: Family — Priority: P1 — Due: TBD

### Next
- [M-002] Improve reporting compliance tracker and daily submission checks — Owner: MILO — Lane: Icebreaker — Priority: P0 — Due: TBD
- [M-003] Build accountability clarity map (owner per route/reporting step) — Owner: MILO — Lane: Icebreaker — Priority: P1 — Due: TBD
- [M-005] Build real-estate follow-up queue discipline board (no changes to existing RE behavior files) — Owner: MILO — Lane: RealEstate — Priority: P0 — Due: TBD

### Doing
- [M-001] Reduce route misses with daily exception list and follow-up prompts — Owner: MILO — Lane: Icebreaker — Priority: P0 — Due: TBD — **PROGRESS**: Created exception tracking system with daily tracker, follow-up prompts, and automated checker script. Next: integrate with cron for automated daily runs.

### Blocked
- (empty)

### Done
- [M-009] Enforce mandatory Kanban session-close policy and no-send default behavior — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-25 — Result: Policy enforced in SOP/runtime rules and session tracking files updated. Output: /Users/milomoussa/.openclaw/workspace/SOP_kanban.md
- [M-010] Prepare secure GitHub login path for Codex operations — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-25 — Result: Installed GitHub CLI (`gh`) and validated login prerequisite without requesting credentials in chat. Output: /opt/homebrew/Cellar/gh/2.87.3
- [M-011] Complete GitHub CLI authentication for repo create/edit/push operations — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-25 — Result: Device auth completed; GitHub account `momoussa2000` is logged in and Git HTTPS credentials are active via `gh auth setup-git`.
- [M-012] Build and deploy `milo-kanban-ui` with GitHub API persistence for `kanban.md` + `accomplishments.md` — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-25 — Result: Created app, pushed repo, deployed to Vercel, and verified `/api/state` live integration. Output: https://milo-kanban-ui.vercel.app
- [M-013] Upgrade Milo Telegram admin operator mode for full Mac Mini operation — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-25 — Result: Added admin operator mode (`always/smart/off`), expanded natural-language operator routing, added runner quick actions for opening Mac apps/URLs and sending email via Mail.app, restricted operator access to admin DM chat only, redeployed Vercel, validated live operator tasks, and installed launchd auto-start for runner. Output: /Users/milomoussa/Moussa Realestate /lib/telegram.ts
- [M-014] Rename Kanban app directory from `milo-kanban-ui` to `kanban` — Owner: MILO — Lane: Admin — Priority: P1 — Due: 2026-02-25 — Result: Renamed folder successfully and verified new path exists. Output: /Users/milomoussa/Moussa Realestate/kanban
- [M-015] Confirm post-rename directory layout and preserve correct runner target path — Owner: MILO — Lane: Admin — Priority: P1 — Due: 2026-02-25 — Result: Verified `/Users/milomoussa/kanban` exists for Kanban project while main operator/deployment repo remains `/Users/milomoussa/Moussa Realestate `, and runner path remains unchanged intentionally.
- [M-016] Diagnose missing Telegram execution event and verify operator routing behavior — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-26 — Result: Confirmed no operator task was queued for family group chat ID; operator queue currently only accepts admin DM chat (`8402424438`), while family group remains advisory-only by design.
- [M-017] Improve non-technical admin phrasing support and fix runner execution environment — Owner: MILO — Lane: Admin — Priority: P0 — Due: 2026-02-26 — Result: Added narrative intent extraction for retry/status-style messages, mapped Next.js setup wording into executable operator instruction, set stable project alias path (`/Users/milomoussa/milo-main`), forced `.env.local` override in runner, and switched operator executor to absolute Codex binary path.
- [M-004] Set real-estate pipeline rhythm checklist (daily + weekly cadence) — Owner: MILO — Lane: RealEstate — Priority: P0 — Due: 2026-02-27 — Result: Created comprehensive pipeline rhythm system with daily/weekly checklists, execution log, metrics tracker, and README. System covers all pipeline stages, key metrics, exception tracking, and SOPs. Ready for implementation. Output: /Users/milomoussa/projects/realestate/pipeline/
- [M-006] Build PhotonLabs pre-launch readiness checklist and milestone tracker — Owner: MILO — Lane: OMOTO — Priority: P1 — Due: 2026-02-27 — Result: Created comprehensive pre-launch readiness system with 5 readiness categories (product, infrastructure, marketing, operations, launch prep), detailed milestone tracker with timeline, risk management, success metrics, and launch day checklist. Includes scoring system (25-30 points = ready to launch). Output: /Users/milomoussa/projects/photonlabs/pre-launch/

## B) MOUSSA Kanban (tasks Moussa must do/approve)

### Backlog
- [U-004] Confirm health non-negotiables and schedule boundaries for training/sleep consistency — Owner: MOUSSA — Lane: Health — Priority: P1 — Due: TBD
- [U-005] Confirm family admin routine and preferred communication cadence — Owner: MOUSSA — Lane: Family — Priority: P1 — Due: TBD

### Next
- [U-003] Approve PhotonLabs pre-launch priority order and first milestone dates — Owner: MOUSSA — Lane: OMOTO — Priority: P1 — Due: TBD

### Doing
- [U-001] Approve Icebreaker focus order: route misses down, reporting compliance up, accountability clarity — Owner: MOUSSA — Lane: Icebreaker — Priority: P0 — Due: TBD
- [U-002] Approve real-estate pipeline rhythm and follow-up queue discipline cadence — Owner: MOUSSA — Lane: RealEstate — Priority: P0 — Due: TBD

### Blocked
- (empty)

### Done
- (empty)
