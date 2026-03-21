"use client";

import { useEffect, useState } from "react";
import QuizPlayer from "@/components/QuizPlayer";
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
  { id: "careless", label: "Careless mistake" },
  { id: "did-not-know", label: "Did not know concept" },
  { id: "misread", label: "Misread question" },
  { id: "formula", label: "Formula or process mistake" },
  { id: "weak-evidence", label: "Weak explanation or evidence" },
];

export default function StudyQuizExperience(props: BaseProps) {
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

  const heading = props.kind === "chapter-quiz" ? "Pre-quiz check-in" : props.kind === "unit-exam" ? "Pre-exam check-in" : "Mock-exam check-in";

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-[#111118] p-5">
        <p className="text-xs font-body font-medium uppercase tracking-[0.22em] text-[#9d96ff]">{heading}</p>
        <p className="mt-2 text-sm leading-7 text-[#9793ae]">
          Mark how ready you feel before you start, then reflect after you finish so the dashboard can compare confidence against real results.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
            <span className="text-sm font-semibold text-white">Before you start</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={confidenceBefore}
              onChange={event => setConfidenceBefore(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-[#8b80ff]"
            />
            <p className="mt-2 text-sm text-[#a7a3bd]">{confidenceBefore}% ready</p>
          </label>
          <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
            <span className="text-sm font-semibold text-white">After you finish</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={confidenceAfter}
              onChange={event => setConfidenceAfter(Number(event.target.value))}
              className="mt-4 h-2 w-full cursor-pointer accent-[#8b80ff]"
            />
            <p className="mt-2 text-sm text-[#a7a3bd]">{confidenceAfter}% ready</p>
          </label>
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

      <section className="rounded-[24px] border border-white/10 bg-[#111118] p-5">
        <p className="text-xs font-body font-medium uppercase tracking-[0.22em] text-[#9d96ff]">Post-quiz reflection</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {mistakeOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setMistakes(current =>
                  current.includes(option.id) ? current.filter(item => item !== option.id) : [...current, option.id]
                )
              }
              className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                mistakes.includes(option.id)
                  ? "border-[#8b80ff]/40 bg-[#8b80ff]/14 text-[#d5d0ff]"
                  : "border-white/10 bg-white/[0.03] text-[#8c88a4] hover:border-white/20 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">What tripped you up?</span>
            <textarea
              rows={4}
              value={reflection}
              onChange={event => setReflection(event.target.value)}
              placeholder="Name the exact thing that made this harder than expected."
              className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-white">What should you review tomorrow?</span>
            <textarea
              rows={4}
              value={tomorrowReview}
              onChange={event => setTomorrowReview(event.target.value)}
              placeholder="Leave your future self a concrete next step."
              className="min-h-[96px] w-full rounded-2xl border border-[#262637] bg-[#0c0c12] px-4 py-3 text-sm leading-7 text-[#eceaff] outline-none transition-colors placeholder:text-[#5f5a78] focus:border-[#6c63ff]/50"
            />
          </label>
        </div>

        {savedMisses.length > 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-sm font-semibold text-white">Saved missed questions</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#a7a3bd]">
              {savedMisses.map(question => (
                <li key={question}>- {question}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setReviewLater(current => !current)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              reviewLater
                ? "border-[#8b80ff]/40 bg-[#8b80ff]/14 text-[#d5d0ff]"
                : "border-white/10 bg-white/[0.03] text-[#8c88a4]"
            }`}
          >
            Review later
          </button>
          <button
            type="button"
            onClick={() => setConfused(current => !current)}
            className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
              confused
                ? "border-[#8b80ff]/40 bg-[#8b80ff]/14 text-[#d5d0ff]"
                : "border-white/10 bg-white/[0.03] text-[#8c88a4]"
            }`}
          >
            Still confusing
          </button>
        </div>
      </section>
    </div>
  );
}
