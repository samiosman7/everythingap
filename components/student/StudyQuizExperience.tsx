"use client";

import { useEffect, useState } from "react";
import QuizPlayer, { normalizeQuizQuestions } from "@/components/QuizPlayer";
import {
  getChapterWorkspace,
  getUnitWorkspace,
  pushRemoteStudyProgress,
  recordQuizResult,
  saveChapterWorkspace,
  saveUnitWorkspace,
  syncStudyProgressFromAccount,
} from "@/lib/study-progress";
import type { QuizQuestion } from "@/types";

type MistakeCategory = "careless" | "did-not-know" | "misread" | "formula" | "weak-evidence";

type BaseProps = {
  questions: QuizQuestion[];
  color: string;
  courseId: string;
  unitId?: string;
  chapterId?: string;
  href: string;
  label: string;
  courseName: string;
  unitName?: string;
  chapterName?: string;
  kind: "chapter-quiz" | "unit-exam" | "full-exam";
};

const mistakeOptions: Array<{ id: MistakeCategory; label: string }> = [
  { id: "careless", label: "Careless" },
  { id: "did-not-know", label: "Concept gap" },
  { id: "misread", label: "Misread" },
  { id: "formula", label: "Formula/process" },
  { id: "weak-evidence", label: "Weak explanation" },
];

export default function StudyQuizExperience(props: BaseProps) {
  const safeQuestions = normalizeQuizQuestions(props.questions);
  const [ready, setReady] = useState(false);
  const [confidenceBefore, setConfidenceBefore] = useState(50);
  const [confidenceAfter, setConfidenceAfter] = useState(50);
  const [reflection, setReflection] = useState("");
  const [tomorrowReview, setTomorrowReview] = useState("");
  const [savedMisses, setSavedMisses] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<MistakeCategory[]>([]);
  const [reviewLater, setReviewLater] = useState(false);
  const [confused, setConfused] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      await syncStudyProgressFromAccount();
      const workspace = props.chapterId ? getChapterWorkspace(props.chapterId) : props.unitId ? getUnitWorkspace(props.unitId) : null;

      if (!mounted || !workspace) {
        setReady(true);
        return;
      }

      setConfidenceBefore(workspace.quizConfidenceBefore?.value ?? workspace.confidence?.value ?? 50);
      setConfidenceAfter(workspace.quizConfidenceAfter?.value ?? workspace.confidence?.value ?? 50);
      setReflection(workspace.quizReflection ?? workspace.reflection ?? "");
      setTomorrowReview(workspace.tomorrowReview ?? "");
      setSavedMisses(workspace.missedQuestionPrompts ?? []);
      setMistakes((workspace.quizMistakePatterns ?? []).filter((item): item is MistakeCategory => mistakeOptions.some(option => option.id === item)));
      setReviewLater(workspace.reviewLater ?? false);
      setConfused(workspace.confused ?? false);
      setReady(true);
    }

    void hydrate();
    return () => {
      mounted = false;
    };
  }, [props.chapterId, props.unitId]);

  useEffect(() => {
    if (!ready || (!props.chapterId && !props.unitId)) return;

    const timeout = window.setTimeout(() => {
      if (props.chapterId) {
        const next = saveChapterWorkspace(
          props.chapterId,
          {
            courseId: props.courseId,
            unitId: props.unitId,
            chapterId: props.chapterId,
            href: props.href,
            label: props.label,
          },
          {
            quizReflection: reflection,
            tomorrowReview,
            reviewLater,
            confused,
            quizMistakePatterns: mistakes,
            missedQuestionPrompts: savedMisses,
            confidenceValue: completed ? confidenceAfter : confidenceBefore,
            quizConfidenceBeforeValue: confidenceBefore,
            quizConfidenceAfterValue: confidenceAfter,
          }
        );
        void pushRemoteStudyProgress(next).catch(() => {});
      } else if (props.unitId) {
        const next = saveUnitWorkspace(
          props.unitId,
          {
            courseId: props.courseId,
            unitId: props.unitId,
            href: props.href,
            label: props.label,
          },
          {
            quizReflection: reflection,
            tomorrowReview,
            reviewLater,
            confused,
            quizMistakePatterns: mistakes,
            missedQuestionPrompts: savedMisses,
            confidenceValue: completed ? confidenceAfter : confidenceBefore,
            quizConfidenceBeforeValue: confidenceBefore,
            quizConfidenceAfterValue: confidenceAfter,
          }
        );
        void pushRemoteStudyProgress(next).catch(() => {});
      }
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [
    completed,
    confidenceAfter,
    confidenceBefore,
    confused,
    mistakes,
    props.chapterId,
    props.courseId,
    props.href,
    props.label,
    props.unitId,
    ready,
    reflection,
    reviewLater,
    savedMisses,
    tomorrowReview,
  ]);

  if (safeQuestions.length === 0) {
    return (
      <div className="app-panel p-6 text-center">
        <div className="mb-3 text-3xl font-display font-bold">Soon</div>
        <p className="mx-auto max-w-2xl text-sm leading-7 app-copy">
          This quiz does not have valid question data yet. Check back after the content finishes generating.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr,280px] lg:items-center">
          <div>
            <p className="app-kicker">Before you start</p>
            <h3 className="mt-2 font-display text-xl font-semibold">Set a confidence check-in, then get straight to the quiz.</h3>
            <p className="mt-2 text-sm leading-7 app-copy">
              Reflection should happen after the quiz is done, not before every question interrupts the flow.
            </p>
          </div>
          <div className="app-card p-4">
            <label className="text-sm font-semibold">Confidence before starting</label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={confidenceBefore}
              onChange={event => setConfidenceBefore(Number(event.target.value))}
              className="mt-3 h-2 w-full cursor-pointer"
              style={{ accentColor: "var(--accent)" }}
            />
            <p className="mt-2 text-sm app-muted">{confidenceBefore}% ready</p>
          </div>
        </div>
      </section>

      <QuizPlayer
        questions={props.questions}
        color={props.color}
        onComplete={({ correct, total, incorrectQuestions }) => {
          setCompleted(true);
          setSavedMisses(incorrectQuestions);
          const next = recordQuizResult({
            courseId: props.courseId,
            unitId: props.unitId,
            chapterId: props.chapterId,
            correct,
            total,
            kind: props.kind,
          });
          void pushRemoteStudyProgress(next).catch(() => {});
        }}
      />

      {completed && (
        <section className="app-panel p-5">
          <p className="app-kicker">After the quiz</p>
          <h3 className="mt-2 font-display text-xl font-semibold">Save the useful reflection, skip the busywork.</h3>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="app-card p-4">
              <label className="text-sm font-semibold">Confidence after finishing</label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={confidenceAfter}
                onChange={event => setConfidenceAfter(Number(event.target.value))}
                className="mt-3 h-2 w-full cursor-pointer"
                style={{ accentColor: "var(--accent)" }}
              />
              <p className="mt-2 text-sm app-muted">{confidenceAfter}% ready</p>
            </div>

            <div className="app-card p-4">
              <p className="text-sm font-semibold">Flag this for later</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setReviewLater(current => !current)}
                  className="app-chip px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: reviewLater ? "var(--accent)" : "var(--line)", background: reviewLater ? "var(--accent-soft)" : undefined }}
                >
                  Review later
                </button>
                <button
                  type="button"
                  onClick={() => setConfused(current => !current)}
                  className="app-chip px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                  style={{ borderColor: confused ? "var(--accent)" : "var(--line)", background: confused ? "var(--accent-soft)" : undefined }}
                >
                  Still confusing
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">What tripped you up?</span>
              <textarea
                rows={4}
                value={reflection}
                onChange={event => setReflection(event.target.value)}
                placeholder="Name the one or two things that actually made this harder than expected."
                className="app-textarea min-h-[96px]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">What should you review next?</span>
              <textarea
                rows={4}
                value={tomorrowReview}
                onChange={event => setTomorrowReview(event.target.value)}
                placeholder="Leave yourself a concrete next step for the next study session."
                className="app-textarea min-h-[96px]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {mistakeOptions.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() =>
                  setMistakes(current =>
                    current.includes(option.id) ? current.filter(item => item !== option.id) : [...current, option.id]
                  )
                }
                className="app-chip px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
                style={{
                  borderColor: mistakes.includes(option.id) ? "var(--accent)" : "var(--line)",
                  background: mistakes.includes(option.id) ? "var(--accent-soft)" : undefined,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          {savedMisses.length > 0 && (
            <div className="app-card mt-4 p-4">
              <p className="text-sm font-semibold">Questions you missed</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 app-copy">
                {savedMisses.map(question => (
                  <li key={question}>- {question}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
