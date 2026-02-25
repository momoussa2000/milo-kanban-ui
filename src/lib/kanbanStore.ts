import "server-only";

import { Octokit } from "octokit";
import type {
  AccomplishmentEntry,
  AccomplishmentsState,
  BoardId,
  KanbanState,
  KanbanTask,
  TaskLane,
  TaskOwner,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

const STATUS_ORDER: TaskStatus[] = ["backlog", "next", "doing", "blocked", "done"];

function nowIso(): string {
  return new Date().toISOString();
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function getRepoConfig() {
  return {
    token: requireEnv("GITHUB_PAT"),
    owner: requireEnv("GITHUB_OWNER"),
    repo: requireEnv("GITHUB_REPO"),
    branch: process.env.GITHUB_BRANCH ?? "main",
    kanbanPath: process.env.KANBAN_FILE_PATH ?? "kanban.md",
    accomplishmentsPath:
      process.env.ACCOMPLISHMENTS_FILE_PATH ?? "accomplishments.md",
  };
}

function getOctokit(token: string): Octokit {
  return new Octokit({ auth: token });
}

async function readRepoFile(
  path: string,
): Promise<{ content: string; sha?: string } | null> {
  const config = getRepoConfig();
  const octokit = getOctokit(config.token);

  try {
    const response = await octokit.rest.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path,
      ref: config.branch,
    });

    if (Array.isArray(response.data)) {
      throw new Error(`Expected file at ${path}, found directory.`);
    }

    if (!("content" in response.data) || !response.data.content) {
      return null;
    }

    const decoded = Buffer.from(response.data.content, "base64").toString("utf8");
    return { content: decoded, sha: response.data.sha };
  } catch (error) {
    const e = error as { status?: number };
    if (e.status === 404) {
      return null;
    }
    throw error;
  }
}

async function writeRepoFile(
  path: string,
  content: string,
  message: string,
  sha?: string,
) {
  const config = getRepoConfig();
  const octokit = getOctokit(config.token);

  await octokit.rest.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    message,
    content: Buffer.from(content, "utf8").toString("base64"),
    branch: config.branch,
    sha,
  });
}

function extractJsonBlock(markdown: string): unknown | null {
  const match = markdown.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) {
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function isStatus(value: string): value is TaskStatus {
  return STATUS_ORDER.includes(value as TaskStatus);
}

function boardLabel(board: BoardId): string {
  return board === "milo" ? "MILO Kanban" : "MOUSSA Kanban";
}

function statusLabel(status: TaskStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function defaultSeedTasks(): KanbanTask[] {
  const createdAt = nowIso();
  return [
    {
      id: "M-001",
      title: "Reduce route misses with daily exception list and follow-up prompts",
      owner: "MILO",
      lane: "Icebreaker",
      priority: "P0",
      due: "TBD",
      board: "milo",
      status: "doing",
      updatedAt: createdAt,
    },
    {
      id: "M-002",
      title: "Improve reporting compliance tracker and daily submission checks",
      owner: "MILO",
      lane: "Icebreaker",
      priority: "P0",
      due: "TBD",
      board: "milo",
      status: "next",
      updatedAt: createdAt,
    },
    {
      id: "M-003",
      title: "Build accountability clarity map for route and reporting ownership",
      owner: "MILO",
      lane: "Icebreaker",
      priority: "P1",
      due: "TBD",
      board: "milo",
      status: "next",
      updatedAt: createdAt,
    },
    {
      id: "M-004",
      title: "Set real estate pipeline rhythm checklist with follow-up discipline",
      owner: "MILO",
      lane: "RealEstate",
      priority: "P0",
      due: "TBD",
      board: "milo",
      status: "doing",
      updatedAt: createdAt,
    },
    {
      id: "M-005",
      title: "Build PhotonLabs pre-launch readiness checklist and milestone tracker",
      owner: "MILO",
      lane: "OMOTO",
      priority: "P1",
      due: "TBD",
      board: "milo",
      status: "doing",
      updatedAt: createdAt,
    },
    {
      id: "M-006",
      title: "Create health routine tracker for training, back and ankle safety, and sleep",
      owner: "MILO",
      lane: "Health",
      priority: "P1",
      due: "TBD",
      board: "milo",
      status: "backlog",
      updatedAt: createdAt,
    },
    {
      id: "M-007",
      title: "Create family admin planning template to reduce communication friction",
      owner: "MILO",
      lane: "Family",
      priority: "P1",
      due: "TBD",
      board: "milo",
      status: "backlog",
      updatedAt: createdAt,
    },
  ];
}

function defaultKanbanState(): KanbanState {
  return {
    lastUpdated: nowIso(),
    wipLimit: 3,
    tasks: defaultSeedTasks(),
  };
}

function defaultAccomplishmentsState(): AccomplishmentsState {
  return {
    lastUpdated: nowIso(),
    entries: [
      {
        date: todayIsoDate(),
        completedIds: [],
        outputs: [],
        decisionsNeeded: [],
        nextActions: [],
      },
    ],
  };
}

function serializeTaskLine(task: KanbanTask): string {
  const base = `[${task.id}] ${task.title} - Owner: ${task.owner} - Lane: ${task.lane} - Priority: ${task.priority} - Due: ${task.due}`;
  if (task.status !== "done") {
    return `- ${base}`;
  }

  const resultPart = task.result ? ` - Result: ${task.result}` : "";
  const outputPart = task.outputPath ? ` - Output: ${task.outputPath}` : "";
  return `- ${base}${resultPart}${outputPart}`;
}

function renderKanbanMarkdown(state: KanbanState): string {
  const lines: string[] = [
    "# Kanban",
    "",
    `Last updated: ${state.lastUpdated}`,
    `WIP limit: max ${state.wipLimit} items in Doing per board.`,
    "",
  ];

  const boards: BoardId[] = ["milo", "moussa"];
  for (const board of boards) {
    lines.push(`## ${boardLabel(board)}`);
    lines.push("");
    for (const status of STATUS_ORDER) {
      lines.push(`### ${statusLabel(status)}`);
      const items = state.tasks.filter(
        (task) => task.board === board && task.status === status,
      );
      if (items.length === 0) {
        lines.push("- (empty)");
      } else {
        items.forEach((task) => lines.push(serializeTaskLine(task)));
      }
      lines.push("");
    }
  }

  lines.push("```json");
  lines.push(JSON.stringify(state, null, 2));
  lines.push("```");

  return lines.join("\n");
}

function renderAccomplishmentsMarkdown(state: AccomplishmentsState): string {
  const lines: string[] = ["# Accomplishments Log", "", `Last updated: ${state.lastUpdated}`, ""];

  for (const entry of state.entries) {
    lines.push(`## ${entry.date}`);
    lines.push(`- Completed (IDs): ${entry.completedIds.join(", ")}`);
    lines.push(`- Outputs produced (paths/links): ${entry.outputs.join(", ")}`);
    lines.push(`- Decisions needed from Moussa: ${entry.decisionsNeeded.join("; ")}`);
    lines.push("- Next 3 actions:");
    if (entry.nextActions.length === 0) {
      lines.push("  - none");
    } else {
      entry.nextActions.forEach((next) => lines.push(`  - ${next}`));
    }
    lines.push("");
  }

  lines.push("```json");
  lines.push(JSON.stringify(state, null, 2));
  lines.push("```");

  return lines.join("\n");
}

function parseKanbanState(markdown: string): KanbanState {
  const parsed = extractJsonBlock(markdown);
  if (
    parsed &&
    typeof parsed === "object" &&
    "tasks" in parsed &&
    Array.isArray((parsed as { tasks: unknown[] }).tasks)
  ) {
    return parsed as KanbanState;
  }
  return defaultKanbanState();
}

function parseAccomplishmentsState(markdown: string): AccomplishmentsState {
  const parsed = extractJsonBlock(markdown);
  if (
    parsed &&
    typeof parsed === "object" &&
    "entries" in parsed &&
    Array.isArray((parsed as { entries: unknown[] }).entries)
  ) {
    return parsed as AccomplishmentsState;
  }
  return defaultAccomplishmentsState();
}

export async function loadState() {
  const { kanbanPath, accomplishmentsPath } = getRepoConfig();
  const [kanbanFile, accomplishmentsFile] = await Promise.all([
    readRepoFile(kanbanPath),
    readRepoFile(accomplishmentsPath),
  ]);

  const kanban = kanbanFile
    ? parseKanbanState(kanbanFile.content)
    : defaultKanbanState();
  const accomplishments = accomplishmentsFile
    ? parseAccomplishmentsState(accomplishmentsFile.content)
    : defaultAccomplishmentsState();

  return {
    kanban,
    accomplishments,
    kanbanSha: kanbanFile?.sha,
    accomplishmentsSha: accomplishmentsFile?.sha,
  };
}

export async function ensureFiles() {
  const config = getRepoConfig();
  const state = await loadState();

  if (!state.kanbanSha) {
    await writeRepoFile(
      config.kanbanPath,
      renderKanbanMarkdown(state.kanban),
      "Initialize kanban.md via milo-kanban-ui",
    );
  }
  if (!state.accomplishmentsSha) {
    await writeRepoFile(
      config.accomplishmentsPath,
      renderAccomplishmentsMarkdown(state.accomplishments),
      "Initialize accomplishments.md via milo-kanban-ui",
    );
  }

  return loadState();
}

function boardPrefix(board: BoardId): string {
  return board === "milo" ? "M" : "U";
}

function nextTaskId(tasks: KanbanTask[], board: BoardId): string {
  const prefix = boardPrefix(board);
  let max = 0;
  for (const task of tasks) {
    if (!task.id.startsWith(`${prefix}-`)) {
      continue;
    }
    const value = Number.parseInt(task.id.split("-")[1] ?? "0", 10);
    if (Number.isFinite(value)) {
      max = Math.max(max, value);
    }
  }
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function enforceWipLimit(state: KanbanState, board: BoardId, movingTaskId?: string) {
  const doingCount = state.tasks.filter(
    (task) =>
      task.board === board &&
      task.status === "doing" &&
      (!movingTaskId || task.id !== movingTaskId),
  ).length;
  if (doingCount >= state.wipLimit) {
    throw new Error(
      `WIP limit reached for ${boardLabel(board)}. Move another task out of Doing first.`,
    );
  }
}

export async function createTask(input: {
  title: string;
  owner: TaskOwner;
  lane: TaskLane;
  priority: TaskPriority;
  due: string;
  board: BoardId;
}) {
  const config = getRepoConfig();
  const state = await loadState();
  const task: KanbanTask = {
    id: nextTaskId(state.kanban.tasks, input.board),
    title: input.title.trim(),
    owner: input.owner,
    lane: input.lane,
    priority: input.priority,
    due: input.due.trim() || "TBD",
    board: input.board,
    status: "backlog",
    updatedAt: nowIso(),
  };

  state.kanban.tasks.push(task);
  state.kanban.lastUpdated = nowIso();

  await writeRepoFile(
    config.kanbanPath,
    renderKanbanMarkdown(state.kanban),
    `Add task ${task.id} via milo-kanban-ui`,
    state.kanbanSha,
  );

  return task;
}

function upsertTodayEntry(state: AccomplishmentsState): AccomplishmentEntry {
  const today = todayIsoDate();
  let entry = state.entries.find((item) => item.date === today);
  if (!entry) {
    entry = {
      date: today,
      completedIds: [],
      outputs: [],
      decisionsNeeded: [],
      nextActions: [],
    };
    state.entries.unshift(entry);
  }
  return entry;
}

export async function updateTask(input: {
  id: string;
  status: TaskStatus;
  result?: string;
  outputPath?: string;
}) {
  const config = getRepoConfig();
  const state = await loadState();
  const task = state.kanban.tasks.find((item) => item.id === input.id);
  if (!task) {
    throw new Error(`Task not found: ${input.id}`);
  }

  if (!isStatus(input.status)) {
    throw new Error("Invalid status.");
  }

  if (input.status === "doing" && task.status !== "doing") {
    enforceWipLimit(state.kanban, task.board, task.id);
  }

  task.status = input.status;
  task.updatedAt = nowIso();

  if (input.status === "done") {
    task.result = input.result?.trim() || "Completed";
    task.outputPath = input.outputPath?.trim();

    const today = upsertTodayEntry(state.accomplishments);
    if (!today.completedIds.includes(task.id)) {
      today.completedIds.push(task.id);
    }
    if (task.outputPath && !today.outputs.includes(task.outputPath)) {
      today.outputs.push(task.outputPath);
    }
    state.accomplishments.lastUpdated = nowIso();
  }

  state.kanban.lastUpdated = nowIso();

  await Promise.all([
    writeRepoFile(
      config.kanbanPath,
      renderKanbanMarkdown(state.kanban),
      `Move task ${task.id} to ${task.status} via milo-kanban-ui`,
      state.kanbanSha,
    ),
    writeRepoFile(
      config.accomplishmentsPath,
      renderAccomplishmentsMarkdown(state.accomplishments),
      `Update accomplishments for ${task.id} via milo-kanban-ui`,
      state.accomplishmentsSha,
    ),
  ]);

  return task;
}

