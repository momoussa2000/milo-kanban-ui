import { NextResponse } from "next/server";
import { updateTask } from "@/lib/kanbanStore";
import type { TaskStatus } from "@/lib/types";

type UpdateTaskBody = {
  status?: TaskStatus;
  result?: string;
  outputPath?: string;
};

function isStatus(value: string): value is TaskStatus {
  return ["backlog", "next", "doing", "blocked", "done"].includes(value);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateTaskBody;

    if (!body.status || !isStatus(body.status)) {
      return NextResponse.json({ error: "Status is invalid." }, { status: 400 });
    }

    const task = await updateTask({
      id,
      status: body.status,
      result: body.result,
      outputPath: body.outputPath,
    });

    return NextResponse.json({ task });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update task";
    const status = message.includes("WIP limit") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

