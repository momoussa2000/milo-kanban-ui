import { NextResponse } from "next/server";
import { ensureFiles } from "@/lib/kanbanStore";

export async function GET() {
  try {
    const state = await ensureFiles();
    return NextResponse.json({
      kanban: state.kanban,
      accomplishments: state.accomplishments,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

