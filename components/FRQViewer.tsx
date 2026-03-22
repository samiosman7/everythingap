"use client";

import { useEffect, useState } from "react";
import {
  getFrqWorkspace,
  pushRemoteStudyProgress,
  saveFrqWorkspace,
  syncStudyProgressFromAccount,
} from "@/lib/study-progress";
import type { FRQ, FRQGradeResult } from "@/types";

interface Props {
  questions: FRQ[];
  workspaceMeta?: {
    courseId: string;
    unitId?: string;
    href: string;
    labelPrefix: string;
  };
}

type GradeState = {
  answer: string;
  notes: string;
  missedRubric: string;
  improveNext: string;
  reflection: string;
  reviewLater: boolean;
  likelyOnTest: boolean;
  confused: boolean;
  confidenceBefore: number;
  confidenceAfter: number;
  loading: boolean;
  error: string | null;
  notice: string | null;
  result: FRQGradeResult | null;
  history: FRQGradeResult[];
  cooldownUntil: number;
};

type FrqToggleKey = "reviewLater" | "likelyOnTest" | "confused";

function emptyGradeState(): GradeState {
  return {
    answer: "",
    notes: "",
    missedRubric: "",
    improveNext: "",
    reflection: "",
    reviewLater: false,
    likelyOnTest: false,
    confused: false,
    confidenceBefore: 50,
    confidenceAfter: 50,
    loading: false,
    error: null,
    notice: null,
    result: null,
    history: [],
    cooldownUntil: 0,
  };
}

export default function FRQViewer({ questions, workspaceMeta }: Props) {
  const safeQuestions = Array.isArray(questions)
    ? questions
        .map(item => {
          if (!item || typeof item !== "object") return null;
          const raw = item as unknown as Record<string, unknown>;

          const prompt = typeof raw.question === "string" ? raw.question : typeof raw.prompt === "string" ? raw.prompt : "";

          if (!prompt) return null;

          return {
            question: prompt,
            rubric: typeof raw.rubric === "string" ? raw.rubric : "",
            sample_response: typeof raw.sample_response === "string" ? raw.sample_response : "",
          } satisfies FRQ;
        })
        .filter((item): item is FRQ => item !== null)
    : [];
  const [open, setOpen] = useState<number | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [gradeStates, setGradeStates] = useState<Record<number, GradeState>>({});

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      if (!workspaceMeta || !mounted) {
        setHydrated(true);
        return;
      }

      const nextState: Record<number, GradeState> = {};

      safeQuestions.forEach((_, index) => {
        const workspace = getFrqWorkspace(`${workspaceMeta.href}#frq-${index + 1}`);
        nextState[index] = {
          ...emptyGradeState(),
          answer: workspace?.draftAnswer ?? "",
          notes: workspace?.notes ?? "",
          missedRubric: workspace?.missedRubric ?? "",
          improveNext: workspace?.improveNext ?? "",
          reflection: workspace?.reflection ?? "",
          reviewLater: workspace?.reviewLater ?? false,
          likelyOnTest: workspace?.likelyOnTest ?? false,
          confused: workspace?.confused ?? false,
          confidenceBefore: workspace?.confidenceBefore?.value ?? 50,
          confidenceAfter: workspace?.confidenceAfter?.value ?? 50,
          history: workspace?.feedbackHistory ?? [],
        };
      });

      if (mounted) {
        setGradeStates(nextState);
        setHydrated(true);
      }
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, [safeQuestions, workspaceMeta]);

  useEffect(() => {
    if (!hydrated || !workspaceMeta) return;

    const timeout = window.setTimeout(() => {
      safeQuestions.forEach((frq, index) => {
        const state = gradeStates[index];
        if (!state) return;

        const next = saveFrqWorkspace(
          `${workspaceMeta.href}#frq-${index + 1}`,
          {
            courseId: workspaceMeta.courseId,
            unitId: workspaceMeta.unitId,
            href: workspaceMeta.href,
            label: `${workspaceMeta.labelPrefix} FRQ ${index + 1}`,
          },
          {
            draftAnswer: state.answer,
            notes: state.notes,
            missedRubric: state.missedRubric,
            improveNext: state.improveNext,
            reflection: state.reflection,
            reviewLater: state.reviewLater,
            likelyOnTest: state.likelyOnTest,
            confused: state.confused,
            confidenceBeforeValue: state.confidenceBefore,
            confidenceAfterValue: state.confidenceAfter,
          }
        );

        void pushRemoteStudyProgress(next).catch(() => {});
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [gradeStates, hydrated, safeQuestions, workspaceMeta]);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] px-6 py-10 text-center">
        <div className="mb-3 text-3xl">Soon</div>
        <p className="text-sm font-body text-[#8888aa]">The free-response section is not available yet for this exam.</p>
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

      const payload = (await response.json()) as {
        result?: FRQGradeResult;
        error?: string;
        cached?: boolean;
        retryAfterSeconds?: number;
      };

      if (!response.ok || !payload.result) {
        if (response.status === 429 && payload.retryAfterSeconds) {
          updateState(index, {
            loading: false,
            error: `${payload.error ?? "Rate limit hit."} Try again in about ${Math.ceil(payload.retryAfterSeconds / 60)} minute(s).`,
            cooldownUntil: Date.now() + payload.retryAfterSeconds * 1000,
          });
          return;
        }
        throw new Error(payload.error ?? "The grader could not score this response.");
      }

      const result = payload.result;

      updateState(index, {
        loading: false,
        result,
        error: null,
        notice: payload.cached
          ? "Same answer detected, so this feedback came from your saved cache instead of using another AI call."
          : "Fresh AI feedback generated. A short cooldown now helps protect your quota.",
        history: [result, ...current.history].slice(0, 8),
        cooldownUntil: Date.now() + 10_000,
      });

      if (workspaceMeta) {
        const next = saveFrqWorkspace(
          `${workspaceMeta.href}#frq-${index + 1}`,
          {
            courseId: workspaceMeta.courseId,
            unitId: workspaceMeta.unitId,
            href: workspaceMeta.href,
            label: `${workspaceMeta.labelPrefix} FRQ ${index + 1}`,
          },
          {
            draftAnswer: answer,
            notes: current.notes,
            missedRubric: current.missedRubric,
            improveNext: current.improveNext,
            reflection: current.reflection,
            reviewLater: current.reviewLater,
            likelyOnTest: current.likelyOnTest,
            confused: current.confused,
            confidenceBeforeValue: current.confidenceBefore,
            confidenceAfterValue: current.confidenceAfter,
            pushFeedback: result,
          }
        );
        void pushRemoteStudyProgress(next).catch(() => {});
      }
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
        const latestHistory = state.history.slice(0, 3);

        return (
          <div key={index} className="overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#111118]">
            <div className="border-b border-[#1e1e2e] p-5">
              <div className="mb-2 text-xs font-body uppercase tracking-widest text-[#8888aa]">FRQ {index + 1}</div>
              <p className="text-sm leading-relaxed text-[#e8e8f0]">{frq.question}</p>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 xl:grid-cols-2">
                <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-sm font-semibold text-white">Confidence before writing</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={state.confidenceBefore}
                    onChange={event => updateState(index, { confidenceBefore: Number(event.target.value) })}
                    className="mt-4 h-2 w-full cursor-pointer accent-[#8b80ff]"
                  />
                  <p className="mt-2 text-sm text-[#a7a3bd]">{state.confidenceBefore}% ready</p>
                </label>
                <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="text-sm font-semibold text-white">Confidence after feedback</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={state.confidenceAfter}
                    onChange={event => updateState(index, { confidenceAfter: Number(event.target.value) })}
                    className="mt-4 h-2 w-full cursor-pointer accent-[#8b80ff]"
                  />
                  <p className="mt-2 text-sm text-[#a7a3bd]">{state.confidenceAfter}% ready</p>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-body font-medium uppercase tracking-[0.18em] text-[#8d89a5]">
                  Draft answer
                </span>
                <textarea
                  value={state.answer}
                  onChange={event => updateState(index, { answer: event.target.value, error: null })}
                  placeholder="Write your FRQ response here. This autosaves so you can come back later."
                  className="min-h-[180px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-4 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
                />
              </label>

              <div className="grid gap-4 xl:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">My draft notes</span>
                  <textarea
                    rows={4}
                    value={state.notes}
                    onChange={event => updateState(index, { notes: event.target.value })}
                    placeholder="Outline evidence, thesis ideas, or reminders for this FRQ."
                    className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">What rubric point did I miss?</span>
                  <textarea
                    rows={4}
                    value={state.missedRubric}
                    onChange={event => updateState(index, { missedRubric: event.target.value })}
                    placeholder="Name the exact rubric point or evidence move you are still missing."
                    className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">What I want to improve next time</span>
                  <textarea
                    rows={4}
                    value={state.improveNext}
                    onChange={event => updateState(index, { improveNext: event.target.value })}
                    placeholder="How would you make the next attempt stronger?"
                    className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-white">Post-FRQ reflection</span>
                  <textarea
                    rows={4}
                    value={state.reflection}
                    onChange={event => updateState(index, { reflection: event.target.value })}
                    placeholder="What topic do you want more help with, or what part still feels shaky?"
                    className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                {([
                  { key: "reviewLater", label: "Review later" },
                  { key: "likelyOnTest", label: "Likely on the test" },
                  { key: "confused", label: "Still confusing" },
                ] as Array<{ key: FrqToggleKey; label: string }>).map(item => {
                  const isActive = state[item.key];

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => updateState(index, { [item.key]: !isActive } as Partial<GradeState>)}
                      className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                        isActive
                          ? "border-[#8b80ff]/40 bg-[#8b80ff]/14 text-[#d5d0ff]"
                          : "border-white/10 bg-white/[0.03] text-[#8c88a4] hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => gradeResponse(index, frq)}
                  disabled={
                    state.loading ||
                    state.cooldownUntil > Date.now() ||
                    !frq.rubric.trim() ||
                    !frq.sample_response.trim()
                  }
                  className="rounded-2xl bg-[#8b80ff] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9a90ff] disabled:cursor-not-allowed disabled:bg-[#5e57aa]"
                >
                  {state.loading
                    ? "Grading..."
                    : !frq.rubric.trim() || !frq.sample_response.trim()
                      ? "Rubric not ready yet"
                    : state.cooldownUntil > Date.now()
                      ? `Wait ${Math.max(1, Math.ceil((state.cooldownUntil - Date.now()) / 1000))}s`
                      : "Get AI feedback"}
                </button>
                <button
                  onClick={() =>
                    updateState(index, {
                      answer: "",
                      notes: "",
                      missedRubric: "",
                      improveNext: "",
                      reflection: "",
                      result: null,
                      error: null,
                    })
                  }
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-[#d8d5e8] transition-colors hover:bg-white/10"
                >
                  Clear draft
                </button>
              </div>

              {state.error && <p className="text-sm text-[#ff9d9d]">{state.error}</p>}
              {state.notice && !state.error && <p className="text-sm text-[#9fd4ff]">{state.notice}</p>}
              {(!frq.rubric.trim() || !frq.sample_response.trim()) && (
                <p className="text-sm text-[#8f8cab]">
                  This FRQ can still be written, but AI rubric grading is disabled until rubric and sample-response data are available.
                </p>
              )}

              {state.result && (
                <div className="space-y-4 rounded-[24px] border border-[#2b2752] bg-[#100f1f] p-5">
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
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#ffb3b3]">What is missing</p>
                      <ul className="space-y-2 text-sm leading-6 text-[#d8d5e8]">
                        {state.result.misses.map(item => (
                          <li key={item}>- {item}</li>
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
                                item.earned ? "bg-[#1d5139] text-[#aef3cb]" : "bg-[#5a2222] text-[#ffb3b3]"
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

              {latestHistory.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-[#8d89a5]">Recent feedback history</p>
                  <div className="space-y-3">
                    {latestHistory.map((item, historyIndex) => (
                      <div key={`${item.verdict}-${historyIndex}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                        <p className="text-sm font-semibold text-white">
                          Attempt {historyIndex + 1}: {item.score}/{item.max_score}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[#a7a3bd]">{item.verdict}</p>
                      </div>
                    ))}
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
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-green-400">Sample high-scoring response</p>
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
