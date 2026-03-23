"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { QuizQuestion } from "@/types";

interface Props {
  questions: QuizQuestion[];
  color?: string;
  onComplete?: (summary: { correct: number; total: number; incorrectQuestions: string[] }) => void;
}

type SafeQuestion = {
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
};

export function normalizeQuizQuestions(questions: QuizQuestion[] | unknown): SafeQuestion[] {
  if (!Array.isArray(questions)) return [];

  return questions
    .map((item): SafeQuestion | null => {
      if (!item || typeof item !== "object") return null;

      const rawQuestion = "question" in item ? item.question : "";
      const rawChoices =
        "choices" in item
          ? item.choices
          : "options" in item
            ? item.options
            : [];
      const rawAnswerIndex =
        "answer_index" in item
          ? item.answer_index
          : "answer" in item
            ? item.answer
            : -1;
      const rawExplanation = "explanation" in item ? item.explanation : "";

      if (typeof rawQuestion !== "string") return null;

      const choices = Array.isArray(rawChoices)
        ? rawChoices.filter((choice): choice is string => typeof choice === "string")
        : rawChoices && typeof rawChoices === "object"
          ? ["A", "B", "C", "D", "E"]
              .map(key => rawChoices[key as keyof typeof rawChoices])
              .filter((choice): choice is string => typeof choice === "string")
          : [];
      if (choices.length < 2) return null;

      const answerIndex =
        typeof rawAnswerIndex === "number" && rawAnswerIndex >= 0 && rawAnswerIndex < choices.length
          ? rawAnswerIndex
          : typeof rawAnswerIndex === "string" && /^[A-E]$/i.test(rawAnswerIndex)
            ? Math.max(0, "ABCDE".indexOf(rawAnswerIndex.toUpperCase()))
          : 0;

      return {
        question: rawQuestion,
        choices,
        answerIndex,
        explanation: typeof rawExplanation === "string" ? rawExplanation : "",
      };
    })
    .filter((item): item is SafeQuestion => item !== null);
}

export default function QuizPlayer({ questions, color = "var(--accent)", onComplete }: Props) {
  const safeQuestions = useMemo(() => normalizeQuizQuestions(questions), [questions]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(safeQuestions.length).fill(null));
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setAnswers(Array(safeQuestions.length).fill(null));
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setFinished(false);
  }, [safeQuestions.length]);

  if (safeQuestions.length === 0) {
    return (
      <div className="app-panel px-6 py-10 text-center">
        <div className="mb-3 text-3xl font-display font-bold">Soon</div>
        <p className="text-sm app-copy">
          This quiz does not have valid question data yet. Check back after the content finishes generating.
        </p>
      </div>
    );
  }

  const q = safeQuestions[Math.min(current, safeQuestions.length - 1)];
  const score = answers.filter((answer, index) => answer === safeQuestions[index]?.answerIndex).length;

  function handleSelect(index: number) {
    if (revealed) return;
    setSelected(index);
  }

  function handleReveal() {
    if (selected === null) return;
    const nextAnswers = [...answers];
    nextAnswers[current] = selected;
    setAnswers(nextAnswers);
    setRevealed(true);
  }

  function handleNext() {
    if (current < safeQuestions.length - 1) {
      setCurrent(value => value + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      onComplete?.({
        correct: score,
        total: safeQuestions.length,
        incorrectQuestions: safeQuestions
          .filter((question, index) => answers[index] !== question.answerIndex)
          .map(question => question.question),
      });
      setFinished(true);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setSelected(null);
    setRevealed(false);
    setAnswers(Array(safeQuestions.length).fill(null));
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / safeQuestions.length) * 100);
    const summaryLabel = pct >= 80 ? "A+" : pct >= 60 ? "Keep going" : "Review";

    return (
      <div className="animate-fade-up py-10 text-center">
        <div className="mb-4 text-3xl font-display font-bold">{summaryLabel}</div>
        <h2 className="mb-2 font-display text-3xl font-bold">
          {score}/{safeQuestions.length}
        </h2>
        <p className="mb-2 app-muted">{pct}% correct</p>
        <p className="mb-8 text-sm app-copy">
          {pct >= 80
            ? "Great work. You have this chapter under control."
            : pct >= 60
              ? "Solid start. Review the misses and go again."
              : "Use the explanations, then take another shot."}
        </p>

        <div className="mx-auto mb-8 max-w-lg space-y-2 text-left">
          {safeQuestions.map((question, index) => {
            const correct = answers[index] === question.answerIndex;
            return (
              <div
                key={index}
                className={clsx(
                  "flex items-start gap-3 rounded-xl border p-3 text-sm font-body",
                  correct ? "border-green-500/20 bg-green-500/10" : "border-red-500/20 bg-red-500/10"
                )}
              >
                <span className="mt-0.5">{correct ? "Correct" : "Missed"}</span>
                <div>
                  <p className="mb-1">{question.question}</p>
                  {!correct && (
                    <p className="app-muted">Correct: {question.choices[question.answerIndex]}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: color }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--panel-muted)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${((current + 1) / safeQuestions.length) * 100}%`, background: color }}
          />
        </div>
        <span className="text-xs font-body font-mono app-muted">
          {current + 1}/{safeQuestions.length}
        </span>
      </div>

      <div className="app-panel mb-4 p-6">
        <p className="text-base leading-relaxed">{q.question}</p>
      </div>

      <div className="mb-6 space-y-2">
        {q.choices.map((choice, index) => {
          const isCorrect = index === q.answerIndex;
          const isSelected = index === selected;

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              className={clsx(
                "w-full rounded-xl border px-5 py-3.5 text-left text-sm font-body transition-all",
                !revealed && !isSelected && "hover:border-white/20",
                !revealed && isSelected,
                revealed && isCorrect && "border-green-500/40 bg-green-500/10 text-green-400",
                revealed && !isCorrect && isSelected && "border-red-500/40 bg-red-500/10 text-red-400",
                revealed && !isCorrect && !isSelected
              )}
              style={{
                borderColor: !revealed && isSelected ? color : "var(--line)",
                background: !revealed && isSelected ? "color-mix(in srgb, var(--accent-soft) 90%, transparent)" : !revealed ? "var(--panel)" : undefined,
                color: !revealed ? "var(--text)" : undefined,
              }}
            >
              <span className="mr-3 font-mono text-xs opacity-60">{["A", "B", "C", "D"][index] ?? "?"}.</span>
              {choice.replace(/^[A-D]\)\s*/, "")}
            </button>
          );
        })}
      </div>

      {revealed && q.explanation && (
        <div className="app-card mb-6 p-4 animate-fade-in">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider app-muted">Explanation</p>
          <p className="text-sm leading-relaxed app-copy">{q.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: color }}
          >
            Check answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
            style={{ background: color }}
          >
            {current < safeQuestions.length - 1 ? "Next question ->" : "See results ->"}
          </button>
        )}
      </div>
    </div>
  );
}
