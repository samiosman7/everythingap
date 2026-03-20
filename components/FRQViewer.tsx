"use client";

import { useState } from "react";
import type { FRQ, FRQGradeResult } from "@/types";

interface Props {
  questions: FRQ[];
}

type GradeState = {
  answer: string;
  loading: boolean;
  error: string | null;
  result: FRQGradeResult | null;
};

function emptyGradeState(): GradeState {
  return {
    answer: "",
    loading: false,
    error: null,
    result: null,
  };
}

export default function FRQViewer({ questions }: Props) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const [open, setOpen] = useState<number | null>(null);
  const [gradeStates, setGradeStates] = useState<Record<number, GradeState>>({});

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] px-6 py-10 text-center">
        <div className="mb-3 text-3xl">Soon</div>
        <p className="text-sm font-body text-[#8888aa]">
          The free-response section is not available yet for this exam.
        </p>
      </div>
    );
  }

  const getState = (index: number) => gradeStates[index] ?? emptyGradeState();

  const updateState = (index: number, patch: Partial<GradeState>) => {
    setGradeStates(current => ({
      ...current,
      [index]: {
        ...getState(index),
        ...patch,
      },
    }));
  };

  const gradeResponse = async (index: number, frq: FRQ) => {
    const current = getState(index);
    const answer = current.answer.trim();

    if (!answer) {
      updateState(index, { error: "Write a response first so the grader has something to evaluate." });
      return;
    }

    updateState(index, { loading: true, error: null });

    try {
      const response = await fetch("/api/frq-grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: frq.question,
          rubric: frq.rubric,
          sampleResponse: frq.sample_response,
          studentAnswer: answer,
        }),
      });

      const payload = (await response.json()) as { result?: FRQGradeResult; error?: string };

      if (!response.ok || !payload.result) {
        throw new Error(payload.error ?? "The grader could not score this response.");
      }

      updateState(index, {
        loading: false,
        result: payload.result,
        error: null,
      });
    } catch (error) {
      updateState(index, {
        loading: false,
        error: error instanceof Error ? error.message : "Something went wrong while grading your response.",
      });
    }
  };

  return (
    <div className="space-y-4">
      {safeQuestions.map((frq, index) => {
        const state = getState(index);

        return (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#111118]">
            <div className="border-b border-[#1e1e2e] p-5">
              <div className="mb-2 text-xs font-body uppercase tracking-widest text-[#8888aa]">FRQ {index + 1}</div>
              <p className="text-sm leading-relaxed text-[#e8e8f0]">{frq.question}</p>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-xs font-body font-medium uppercase tracking-[0.18em] text-[#8d89a5]">
                Write your response
              </label>
              <textarea
                value={state.answer}
                onChange={event => updateState(index, { answer: event.target.value, error: null })}
                placeholder="Write your FRQ response here. Be as complete as you would be on the exam."
                className="min-h-[180px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-4 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
              />

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => gradeResponse(index, frq)}
                  disabled={state.loading}
                  className="rounded-2xl bg-[#8b80ff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9a90ff] disabled:cursor-not-allowed disabled:bg-[#5e57aa]"
                >
                  {state.loading ? "Grading..." : "Get AI feedback"}
                </button>
                <button
                  onClick={() =>
                    updateState(index, {
                      answer: "",
                      result: null,
                      error: null,
                      loading: false,
                    })
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#d8d5e8] transition-colors hover:bg-white/10"
                >
                  Clear
                </button>
              </div>

              {state.error && <p className="mt-3 text-sm text-[#ff9d9d]">{state.error}</p>}

              {state.result && (
                <div className="mt-5 space-y-4 rounded-[24px] border border-[#2b2752] bg-[#100f1f] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-body uppercase tracking-[0.18em] text-[#b9b4ff]">AI score estimate</p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-white">
                        {state.result.score}/{state.result.max_score}
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm leading-7 text-[#d2cee8]">{state.result.verdict}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#8cffbf]">What earned points</p>
                      <ul className="space-y-2 text-sm leading-6 text-[#d8d5e8]">
                        {state.result.strengths.map(item => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#ffb3b3]">What is missing</p>
                      <ul className="space-y-2 text-sm leading-6 text-[#d8d5e8]">
                        {state.result.misses.map(item => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#b9b4ff]">Rubric breakdown</p>
                    <div className="space-y-3">
                      {state.result.rubric_breakdown.map(item => (
                        <div key={`${item.criterion}-${item.reason}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-white">{item.criterion}</p>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                                item.earned
                                  ? "bg-[#1d5139] text-[#aef3cb]"
                                  : "bg-[#5a2222] text-[#ffb3b3]"
                              }`}
                            >
                              {item.earned ? "earned" : "missed"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-[#c9c5de]">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#ffd38b]">Revision advice</p>
                    <p className="text-sm leading-7 text-[#e6e1c7]">{state.result.revision_advice}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#1e1e2e]">
              <button
                onClick={() => setOpen(open === index ? null : index)}
                className="flex w-full items-center justify-between px-5 py-3 text-left text-xs font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
              >
                <span>View rubric and sample response</span>
                <span>{open === index ? "Hide" : "Show"}</span>
              </button>
              {open === index && (
                <div className="space-y-4 px-5 pb-5">
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#6c63ff]">Scoring rubric</p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#c0c0d8]">{frq.rubric}</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-green-400">
                      Sample high-scoring response
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#c0c0d8]">{frq.sample_response}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
