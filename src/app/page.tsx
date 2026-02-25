"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
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
const BOARD_ORDER: BoardId[] = ["milo", "moussa"];
const LANE_OPTIONS: TaskLane[] = [
  "Icebreaker",
  "RealEstate",
  "OMOTO",
  "Hathor",
  "Health",
  "Family",
  "Admin",
];
const PRIORITY_OPTIONS: TaskPriority[] = ["P0", "P1", "P2"];

function boardLabel(board: BoardId) {
  return board === "milo" ? "MILO Board" : "MOUSSA Board";
}

function statusLabel(status: TaskStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: TaskStatus) {
  if (status === "doing") return "status-doing";
  if (status === "blocked") return "status-blocked";
  if (status === "done") return "status-done";
  return "status-default";
}

type ApiStateResponse = {
  kanban: KanbanState;
  accomplishments: AccomplishmentsState;
};

type TaskFormState = {
  title: string;
  owner: TaskOwner;
  lane: TaskLane;
  priority: TaskPriority;
  due: string;
  board: BoardId;
};

const INITIAL_FORM: TaskFormState = {
  title: "",
  owner: "MILO",
  lane: "Admin",
  priority: "P1",
  due: "TBD",
  board: "milo",
};

export default function Home() {
  const [kanban, setKanban] = useState<KanbanState | null>(null);
  const [accomplishments, setAccomplishments] = useState<AccomplishmentsState | null>(
    null,
  );
  const [formState, setFormState] = useState<TaskFormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchState() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/state", { cache: "no-store" });
      const payload = (await response.json()) as ApiStateResponse | { error: string };

      if (!response.ok || !("kanban" in payload)) {
        throw new Error(
          "error" in payload ? payload.error : "Failed to load board state.",
        );
      }

      setKanban(payload.kanban);
      setAccomplishments(payload.accomplishments);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected state fetch failure.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchState().catch(() => undefined);
  }, []);

  const groupedTasks = useMemo(() => {
    const grouped: Record<BoardId, Record<TaskStatus, KanbanTask[]>> = {
      milo: {
        backlog: [],
        next: [],
        doing: [],
        blocked: [],
        done: [],
      },
      moussa: {
        backlog: [],
        next: [],
        doing: [],
        blocked: [],
        done: [],
      },
    };

    if (!kanban) return grouped;

    for (const task of kanban.tasks) {
      grouped[task.board][task.status].push(task);
    }
    return grouped;
  }, [kanban]);

  async function createTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create task.");
      }
      setFormState({
        ...INITIAL_FORM,
        owner: formState.board === "milo" ? "MILO" : "MOUSSA",
        board: formState.board,
      });
      await fetchState();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create task.");
    } finally {
      setSaving(false);
    }
  }

  async function moveTask(task: KanbanTask, status: TaskStatus) {
    setSaving(true);
    setError(null);
    try {
      let result = "";
      let outputPath = "";
      if (status === "done") {
        result = prompt(`Result for ${task.id}`, task.result ?? "Completed") ?? "";
        outputPath = prompt(
          `Optional output path for ${task.id}`,
          task.outputPath ?? "",
        ) ?? "";
      }

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          result,
          outputPath,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to move task.");
      }
      await fetchState();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to move task.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="hero">
        <h1>MILO Kanban Control</h1>
        <p>
          Durable state is saved to GitHub files: <code>kanban.md</code> and{" "}
          <code>accomplishments.md</code>.
        </p>
      </header>

      <section className="panel">
        <h2>Add Task</h2>
        <form className="task-form" onSubmit={createTask}>
          <label>
            Title
            <input
              required
              value={formState.title}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, title: event.target.value }))
              }
              placeholder="Task title"
            />
          </label>
          <label>
            Board
            <select
              value={formState.board}
              onChange={(event) => {
                const board = event.target.value as BoardId;
                setFormState((prev) => ({
                  ...prev,
                  board,
                  owner: board === "milo" ? "MILO" : "MOUSSA",
                }));
              }}
            >
              {BOARD_ORDER.map((board) => (
                <option key={board} value={board}>
                  {boardLabel(board)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Owner
            <select
              value={formState.owner}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  owner: event.target.value as TaskOwner,
                }))
              }
            >
              <option value="MILO">MILO</option>
              <option value="MOUSSA">MOUSSA</option>
            </select>
          </label>
          <label>
            Lane
            <select
              value={formState.lane}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  lane: event.target.value as TaskLane,
                }))
              }
            >
              {LANE_OPTIONS.map((lane) => (
                <option key={lane} value={lane}>
                  {lane}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={formState.priority}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  priority: event.target.value as TaskPriority,
                }))
              }
            >
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label>
            Due
            <input
              value={formState.due}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, due: event.target.value }))
              }
              placeholder="YYYY-MM-DD or TBD"
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Add Task"}
          </button>
        </form>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      {loading || !kanban ? (
        <section className="panel">
          <p>Loading board state...</p>
        </section>
      ) : (
        <section className="board-grid">
          {BOARD_ORDER.map((board) => (
            <article className="panel" key={board}>
              <div className="board-header">
                <h2>{boardLabel(board)}</h2>
                <p>
                  WIP limit in Doing: <strong>{kanban.wipLimit}</strong>
                </p>
              </div>
              <div className="columns">
                {STATUS_ORDER.map((status) => (
                  <div key={`${board}-${status}`} className="column">
                    <h3>{statusLabel(status)}</h3>
                    <div className="task-list">
                      {groupedTasks[board][status].length === 0 ? (
                        <p className="empty">No tasks.</p>
                      ) : (
                        groupedTasks[board][status].map((task) => (
                          <div className={`task-card ${statusClass(task.status)}`} key={task.id}>
                            <p className="task-id">{task.id}</p>
                            <p className="task-title">{task.title}</p>
                            <p className="task-meta">
                              {task.owner} | {task.lane} | {task.priority}
                            </p>
                            <p className="task-meta">Due: {task.due}</p>
                            {task.status === "done" ? (
                              <p className="task-result">
                                Result: {task.result ?? "Completed"}
                                {task.outputPath ? ` | Output: ${task.outputPath}` : ""}
                              </p>
                            ) : null}
                            <div className="task-actions">
                              {STATUS_ORDER.filter((nextStatus) => nextStatus !== task.status).map(
                                (nextStatus) => (
                                  <button
                                    key={`${task.id}-${nextStatus}`}
                                    type="button"
                                    disabled={saving}
                                    onClick={() => moveTask(task, nextStatus)}
                                  >
                                    Move to {statusLabel(nextStatus)}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      <section className="panel">
        <h2>Accomplishments</h2>
        {!accomplishments || accomplishments.entries.length === 0 ? (
          <p>No entries yet.</p>
        ) : (
          <div className="accomplishments-list">
            {accomplishments.entries.map((entry) => (
              <div key={entry.date} className="accomplishment-card">
                <h3>{entry.date}</h3>
                <p>
                  <strong>Completed IDs:</strong>{" "}
                  {entry.completedIds.length ? entry.completedIds.join(", ") : "none"}
                </p>
                <p>
                  <strong>Outputs:</strong>{" "}
                  {entry.outputs.length ? entry.outputs.join(", ") : "none"}
                </p>
                <p>
                  <strong>Decisions needed:</strong>{" "}
                  {entry.decisionsNeeded.length
                    ? entry.decisionsNeeded.join("; ")
                    : "none"}
                </p>
                <p>
                  <strong>Next 3 actions:</strong>{" "}
                  {entry.nextActions.length ? entry.nextActions.join(" | ") : "none"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

