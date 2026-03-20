import { NextResponse } from "next/server";
import { gradeFrqResponse } from "@/lib/frq-grader";

type GradeRequestBody = {
  question?: string;
  rubric?: string;
  sampleResponse?: string;
  studentAnswer?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GradeRequestBody;

    const question = body.question?.trim();
    const rubric = body.rubric?.trim();
    const sampleResponse = body.sampleResponse?.trim();
    const studentAnswer = body.studentAnswer?.trim();

    if (!question || !rubric || !sampleResponse || !studentAnswer) {
      return NextResponse.json(
        { error: "Missing question, rubric, sample response, or student answer." },
        { status: 400 }
      );
    }

    if (studentAnswer.length < 20) {
      return NextResponse.json(
        { error: "Write a little more before asking the grader for feedback." },
        { status: 400 }
      );
    }

    const result = await gradeFrqResponse({
      question,
      rubric,
      sampleResponse,
      studentAnswer,
    });

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The grader failed to run.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
