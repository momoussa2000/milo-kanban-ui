import { NextResponse } from "next/server";
import { createTask } from "@/lib/kanbanStore";
import type { BoardId, TaskLane, TaskOwner, TaskPriority } from "@/lib/types";

type CreateTaskBody = {
  title?: string;
  owner?: TaskOwner;
  lane?: TaskLane;
  priority?: TaskPriority;
  due?: string;
  board?: BoardId;
};

function isOwner(value: string): value is TaskOwner {
  return value === "MILO" || value === "MOUSSA";
}

function isLane(value: string): value is TaskLane {
  return [
    "Icebreaker",
    "RealEstate",
    "OMOTO",
    "Hathor",
    "Health",
    "Family",
    "Admin",
  ].includes(value);
}

function isPriority(value: string): value is TaskPriority {
  return ["P0", "P1", "P2"].includes(value);
}

function isBoard(value: string): value is BoardId {
  return value === "milo" || value === "moussa";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateTaskBody;
    const title = body.title?.trim();
    const due = body.due?.trim() || "TBD";

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }
    if (!body.owner || !isOwner(body.owner)) {
      return NextResponse.json({ error: "Owner is invalid." }, { status: 400 });
    }
    if (!body.lane || !isLane(body.lane)) {
      return NextResponse.json({ error: "Lane is invalid." }, { status: 400 });
    }
    if (!body.priority || !isPriority(body.priority)) {
      return NextResponse.json({ error: "Priority is invalid." }, { status: 400 });
    }
    if (!body.board || !isBoard(body.board)) {
      return NextResponse.json({ error: "Board is invalid." }, { status: 400 });
    }

    const task = await createTask({
      title,
      owner: body.owner,
      lane: body.lane,
      priority: body.priority,
      due,
      board: body.board,
    });

    return NextResponse.json({ task });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create task";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

