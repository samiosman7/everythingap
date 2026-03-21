import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import type { StudyProgressState } from "@/lib/study-progress";

const EMPTY_PROGRESS: StudyProgressState = {
  lastVisited: null,
  courses: {},
  workspace: {
    chapters: {},
    units: {},
    flashcards: {},
    frqs: {},
  },
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ progress: EMPTY_PROGRESS });
  }

  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ progress: EMPTY_PROGRESS, localOnly: true });
  }
  const { data, error } = await supabase
    .from("study_progress")
    .select("progress")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ progress: (data?.progress as StudyProgressState | null) ?? EMPTY_PROGRESS });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { progress?: StudyProgressState };
  const progress = body.progress ?? EMPTY_PROGRESS;

  let supabase;
  try {
    supabase = createAdminSupabaseClient();
  } catch {
    return NextResponse.json({ ok: true, localOnly: true });
  }
  const { error } = await supabase.from("study_progress").upsert(
    {
      user_id: userId,
      progress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
