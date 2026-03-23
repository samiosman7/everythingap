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
  workspaceOpen: boolean;
  rubricOpen: boolean;
};

type FrqToggleKey = "reviewLater" | "likelyOnTest" | "confused";

function normalizeTextValue(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map(item => normalizeTextValue(item))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(item => normalizeTextValue(item))
      .filter(Boolean)
      .join("\n\n")
      .trim();
  }
  return "";
}

function normalizeFrq(raw: Record<string, unknown>): FRQ | null {
  const question =
    normalizeTextValue(raw.question) ||
    normalizeTextValue(raw.prompt) ||
    normalizeTextValue(raw.text) ||
    normalizeTextValue(raw.stem) ||
    normalizeTextValue(raw.frq) ||
    normalizeTextValue(raw.instructions);

  if (!question) return null;

  const rubric =
    normalizeTextValue(raw.rubric) ||
    normalizeTextValue(raw.scoring_guidelines) ||
    normalizeTextValue(raw.scoringGuidelines) ||
    normalizeTextValue(raw.guidelines) ||
    normalizeTextValue(raw.criteria);

  const sampleResponse =
    normalizeTextValue(raw.sample_response) ||
    normalizeTextValue(raw.sampleResponse) ||
    normalizeTextValue(raw.sample_answer) ||
    normalizeTextValue(raw.sampleAnswer) ||
    normalizeTextValue(raw.model_response) ||
    normalizeTextValue(raw.modelResponse) ||
    normalizeTextValue(raw.response);

  return {
    question,
    rubric,
    sample_response: sampleResponse,
  };
}

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
    workspaceOpen: false,
    rubricOpen: false,
  };
}

export default function FRQViewer({ questions, workspaceMeta }: Props) {
  const safeQuestions = Array.isArray(questions)
    ? questions
        .map(item => {
          if (!item || typeof item !== "object") return null;
          return normalizeFrq(item as unknown as Record<string, unknown>);
        })
        .filter((item): item is FRQ => item !== null)
    : [];

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
      safeQuestions.forEach((_, index) => {
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
      <div className="app-panel px-6 py-10 text-center">
        <div className="mb-3 text-3xl font-display font-bold">Soon</div>
        <p className="text-sm app-copy">The free-response section is not available yet for this exam.</p>
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

  async function gradeResponse(index: number, frq: FRQ) {
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
        headers: { "Content-Type": "application/json" },
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
          : "Fresh AI feedback generated.",
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
  }

  return (
    <div className="space-y-5">
      {safeQuestions.map((frq, index) => {
        const state = getState(index);
        const latestHistory = state.history.slice(0, 3);
        const gradingAvailable = Boolean(frq.rubric.trim() && frq.sample_response.trim());

        return (
          <section key={index} className="app-panel overflow-hidden">
            <div className="border-b p-5" style={{ borderColor: "var(--line)" }}>
              <div className="mb-2 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--accent)" }}>
                FRQ {index + 1}
              </div>
              <p className="text-sm leading-7">{frq.question}</p>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr,280px]">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Your response</span>
                  <textarea
                    value={state.answer}
                    onChange={event => updateState(index, { answer: event.target.value, error: null })}
                    placeholder="Write your FRQ response here. It autosaves, so you can come back later."
                    className="app-textarea min-h-[220px]"
                  />
                </label>

                <div className="space-y-4">
                  <div className="app-card p-4">
                    <p className="text-sm font-semibold">Confidence before writing</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={state.confidenceBefore}
                      onChange={event => updateState(index, { confidenceBefore: Number(event.target.value) })}
                      className="mt-3 h-2 w-full cursor-pointer"
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <p className="mt-2 text-sm app-muted">{state.confidenceBefore}% ready</p>
                  </div>

                  <div className="app-card p-4">
                    <p className="text-sm font-semibold">Actions</p>
                    <div className="mt-3 flex flex-col gap-3">
                      <button
                        onClick={() => gradeResponse(index, frq)}
                        disabled={state.loading || state.cooldownUntil > Date.now() || !gradingAvailable}
                        className="app-primary-button px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {state.loading
                          ? "Grading..."
                          : !gradingAvailable
                            ? "Rubric not ready yet"
                            : state.cooldownUntil > Date.now()
                              ? `Wait ${Math.max(1, Math.ceil((state.cooldownUntil - Date.now()) / 1000))}s`
                              : "Get AI feedback"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateState(index, { workspaceOpen: !state.workspaceOpen })}
                        className="app-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {state.workspaceOpen ? "Hide private notes" : "Open private notes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateState(index, { rubricOpen: !state.rubricOpen })}
                        className="app-secondary-button px-4 py-3 text-sm font-semibold"
                      >
                        {state.rubricOpen ? "Hide rubric" : "View rubric"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {state.workspaceOpen && (
                <div className="app-card grid gap-4 p-4 xl:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">Private notes</span>
                    <textarea
                      rows={4}
                      value={state.notes}
                      onChange={event => updateState(index, { notes: event.target.value })}
                      placeholder="Outline evidence, structure ideas, or reminders for this FRQ."
                      className="app-textarea min-h-[110px]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">What rubric point am I missing?</span>
                    <textarea
                      rows={4}
                      value={state.missedRubric}
                      onChange={event => updateState(index, { missedRubric: event.target.value })}
                      placeholder="Name the exact point or evidence move you still need."
                      className="app-textarea min-h-[110px]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">What should I improve next?</span>
                    <textarea
                      rows={4}
                      value={state.improveNext}
                      onChange={event => updateState(index, { improveNext: event.target.value })}
                      placeholder="What would make the next draft stronger?"
                      className="app-textarea min-h-[110px]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold">What still feels shaky?</span>
                    <textarea
                      rows={4}
                      value={state.reflection}
                      onChange={event => updateState(index, { reflection: event.target.value })}
                      placeholder="What part still needs help?"
                      className="app-textarea min-h-[110px]"
                    />
                  </label>

                  <div className="xl:col-span-2 flex flex-wrap gap-2">
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
                          className="app-chip px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                          style={{
                            borderColor: isActive ? "var(--accent)" : "var(--line)",
                            background: isActive ? "var(--accent-soft)" : undefined,
                            color: isActive ? "var(--text)" : undefined,
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {state.error && <p className="text-sm" style={{ color: "var(--danger)" }}>{state.error}</p>}
              {state.notice && !state.error && <p className="text-sm" style={{ color: "var(--success)" }}>{state.notice}</p>}
              {!gradingAvailable && (
                <p className="text-sm app-copy">
                  You can still draft this FRQ, but AI scoring is disabled until rubric and sample-response data are available.
                </p>
              )}

              {state.result && (
                <div className="app-card space-y-4 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="app-kicker">AI score estimate</p>
                      <h3 className="mt-2 font-display text-2xl font-bold">
                        {state.result.score}/{state.result.max_score}
                      </h3>
                    </div>
                    <p className="max-w-xl text-sm leading-7 app-copy">{state.result.verdict}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="app-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--success)" }}>What earned points</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 app-copy">
                        {state.result.strengths.map(item => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="app-card p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--danger)" }}>What is missing</p>
                      <ul className="mt-3 space-y-2 text-sm leading-6 app-copy">
                        {state.result.misses.map(item => (
                          <li key={item}>- {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {state.result.rubric_breakdown.map(item => (
                      <div key={`${item.criterion}-${item.reason}`} className="app-card p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{item.criterion}</p>
                          <span
                            className="app-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]"
                            style={{
                              borderColor: item.earned ? "var(--success)" : "var(--danger)",
                              color: item.earned ? "var(--success)" : "var(--danger)",
                            }}
                          >
                            {item.earned ? "earned" : "missed"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 app-copy">{item.reason}</p>
                      </div>
                    ))}
                  </div>

                  <div className="app-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--warning)" }}>Revision advice</p>
                    <p className="mt-2 text-sm leading-7 app-copy">{state.result.revision_advice}</p>
                  </div>
                </div>
              )}

              {latestHistory.length > 0 && (
                <div className="app-card p-4">
                  <p className="text-sm font-semibold">Recent feedback history</p>
                  <div className="mt-3 space-y-3">
                    {latestHistory.map((item, historyIndex) => (
                      <div key={`${item.verdict}-${historyIndex}`} className="rounded-xl border p-3" style={{ borderColor: "var(--line)" }}>
                        <p className="text-sm font-semibold">
                          Attempt {historyIndex + 1}: {item.score}/{item.max_score}
                        </p>
                        <p className="mt-1 text-sm leading-6 app-copy">{item.verdict}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {state.rubricOpen && (
                <div className="app-card grid gap-4 p-4 xl:grid-cols-2">
                  <div>
                    <p className="app-kicker">Scoring rubric</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 app-copy">{frq.rubric || "No rubric available yet."}</p>
                  </div>
                  <div>
                    <p className="app-kicker">Sample response</p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 app-copy">
                      {frq.sample_response || "No sample response available yet."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
