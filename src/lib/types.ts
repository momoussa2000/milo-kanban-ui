export type TaskOwner = "MILO" | "MOUSSA";
export type TaskLane =
  | "Icebreaker"
  | "RealEstate"
  | "OMOTO"
  | "Hathor"
  | "Health"
  | "Family"
  | "Admin";
export type TaskPriority = "P0" | "P1" | "P2";
export type TaskStatus = "backlog" | "next" | "doing" | "blocked" | "done";
export type BoardId = "milo" | "moussa";

export type KanbanTask = {
  id: string;
  title: string;
  owner: TaskOwner;
  lane: TaskLane;
  priority: TaskPriority;
  due: string;
  board: BoardId;
  status: TaskStatus;
  result?: string;
  outputPath?: string;
  updatedAt: string;
};

export type KanbanState = {
  lastUpdated: string;
  wipLimit: number;
  tasks: KanbanTask[];
};

export type AccomplishmentEntry = {
  date: string;
  completedIds: string[];
  outputs: string[];
  decisionsNeeded: string[];
  nextActions: string[];
};

export type AccomplishmentsState = {
  lastUpdated: string;
  entries: AccomplishmentEntry[];
};

