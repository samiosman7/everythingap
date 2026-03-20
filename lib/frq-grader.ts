import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FRQGradeResult } from "@/types";

const DEFAULT_MODEL = process.env.FRQ_GRADER_MODEL ?? "gemini-2.5-flash";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY. Add it in your local env and Vercel to enable FRQ grading.");
  }

  return new GoogleGenerativeAI(apiKey);
}

function extractJSONObject(text: string) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("The grader did not return a valid JSON object.");
  }

  return JSON.parse(text.slice(start, end + 1)) as FRQGradeResult;
}

function normalizeGradeResult(result: FRQGradeResult): FRQGradeResult {
  return {
    score: Number.isFinite(result.score) ? Math.max(0, Math.round(result.score)) : 0,
    max_score: Number.isFinite(result.max_score) ? Math.max(1, Math.round(result.max_score)) : 6,
    verdict: result.verdict?.trim() || "The grader returned feedback, but the summary was incomplete.",
    strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 6) : [],
    misses: Array.isArray(result.misses) ? result.misses.slice(0, 6) : [],
    rubric_breakdown: Array.isArray(result.rubric_breakdown)
      ? result.rubric_breakdown.map(item => ({
          criterion: item.criterion?.trim() || "Rubric point",
          earned: Boolean(item.earned),
          reason: item.reason?.trim() || "No explanation returned.",
        }))
      : [],
    revision_advice: result.revision_advice?.trim() || "Revise by matching each sentence more directly to the rubric.",
  };
}

export async function gradeFrqResponse(input: {
  question: string;
  rubric: string;
  sampleResponse: string;
  studentAnswer: string;
}): Promise<FRQGradeResult> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const prompt = `You are a strict AP free-response grader.

Grade the student's response against the rubric only.

Rules:
- Do not reward points that are not supported by the rubric.
- Do not invent new criteria.
- Be fair to valid answers that are worded differently from the sample response.
- Use the sample response as a quality reference, not as the only acceptable answer.
- Return JSON only.

Return this exact JSON shape:
{
  "score": 0,
  "max_score": 6,
  "verdict": "1-3 sentence summary of the performance",
  "strengths": ["short bullet", "short bullet"],
  "misses": ["short bullet", "short bullet"],
  "rubric_breakdown": [
    {
      "criterion": "criterion name",
      "earned": true,
      "reason": "why this point was earned or missed"
    }
  ],
  "revision_advice": "specific advice for improving this answer"
}

Question:
${input.question}

Rubric:
${input.rubric}

Sample high-scoring response:
${input.sampleResponse}

Student response:
${input.studentAnswer}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = extractJSONObject(text);
  return normalizeGradeResult(parsed);
}
