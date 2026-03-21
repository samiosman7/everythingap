import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createHash } from "node:crypto";
import { gradeFrqResponse } from "@/lib/frq-grader";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

type GradeRequestBody = {
  question?: string;
  rubric?: string;
  sampleResponse?: string;
  studentAnswer?: string;
  detailMode?: "standard" | "deep";
};

const RATE_LIMIT_MAX_CHECKS = 2;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MINIMUM_ANSWER_LENGTH = 80;

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeAnswer(answer: string) {
  return answer.replace(/\s+/g, " ").trim().toLowerCase();
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Sign in to use the FRQ grader." }, { status: 401 });
    }

    const body = (await request.json()) as GradeRequestBody;

    const question = body.question?.trim();
    const rubric = body.rubric?.trim();
    const sampleResponse = body.sampleResponse?.trim();
    const studentAnswer = body.studentAnswer?.trim();
    const detailMode = body.detailMode === "deep" ? "deep" : "standard";

    if (!question || !rubric || !sampleResponse || !studentAnswer) {
      return NextResponse.json(
        { error: "Missing question, rubric, sample response, or student answer." },
        { status: 400 }
      );
    }

    if (studentAnswer.length < MINIMUM_ANSWER_LENGTH) {
      return NextResponse.json(
        { error: `Write a little more before asking the grader for feedback. Aim for at least ${MINIMUM_ANSWER_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const frqKey = sha256(`${question}\n${rubric}`);
    const answerHash = sha256(normalizeAnswer(studentAnswer));

    let supabase;
    try {
      supabase = createAdminSupabaseClient();
    } catch {
      supabase = null;
    }

    if (supabase) {
      const cachedResponse = await supabase
        .from("frq_grade_cache")
        .select("result")
        .eq("user_id", userId)
        .eq("frq_key", frqKey)
        .eq("student_answer_hash", answerHash)
        .maybeSingle();

      if (!cachedResponse.error && cachedResponse.data?.result) {
        return NextResponse.json({
          result: cachedResponse.data.result,
          cached: true,
          detailMode,
          rateLimit: {
            limit: RATE_LIMIT_MAX_CHECKS,
            windowMinutes: RATE_LIMIT_WINDOW_MS / 60000,
          },
        });
      }

      const windowStartIso = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
      const recentChecksResponse = await supabase
        .from("frq_grade_events")
        .select("id, created_at", { count: "exact" })
        .eq("user_id", userId)
        .gte("created_at", windowStartIso);

      if (!recentChecksResponse.error && (recentChecksResponse.count ?? 0) >= RATE_LIMIT_MAX_CHECKS) {
        const timestamps = (recentChecksResponse.data ?? [])
          .map(entry => new Date(entry.created_at).getTime())
          .filter(timestamp => Number.isFinite(timestamp))
          .sort((a, b) => a - b);

        const oldestActive = timestamps[0] ?? Date.now();
        const retryAfterMs = Math.max(0, oldestActive + RATE_LIMIT_WINDOW_MS - Date.now());

        return NextResponse.json(
          {
            error: "You have reached the FRQ grading limit for now. Try again in a few minutes.",
            retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
            rateLimit: {
              limit: RATE_LIMIT_MAX_CHECKS,
              windowMinutes: RATE_LIMIT_WINDOW_MS / 60000,
            },
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil(retryAfterMs / 1000)),
            },
          }
        );
      }

      await supabase.from("frq_grade_events").insert({
        user_id: userId,
        frq_key: frqKey,
        student_answer_hash: answerHash,
        detail_mode: detailMode,
      });
    }

    const result = await gradeFrqResponse({
      question,
      rubric,
      sampleResponse,
      studentAnswer,
      detailMode,
    });

    if (supabase) {
      await supabase.from("frq_grade_cache").upsert(
        {
          user_id: userId,
          frq_key: frqKey,
          student_answer_hash: answerHash,
          detail_mode: detailMode,
          result,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,frq_key,student_answer_hash" }
      );
    }

    return NextResponse.json({
      result,
      cached: false,
      detailMode,
      rateLimit: {
        limit: RATE_LIMIT_MAX_CHECKS,
        windowMinutes: RATE_LIMIT_WINDOW_MS / 60000,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The grader failed to run.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
