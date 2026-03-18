"use client";
import { useState } from "react";
import { QuizQuestion } from "@/types";
import clsx from "clsx";

interface Props {
  questions: QuizQuestion[];
  color?: string;
}

export default function QuizPlayer({ questions, color = "#6c63ff" }: Props) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(safeQuestions.length).fill(null));
  const [finished, setFinished] = useState(false);

  if (safeQuestions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#111118] px-6 py-10 text-center">
        <div className="text-3xl mb-3">Soon</div>
        <p className="text-sm font-body text-[#8888aa]">
          This quiz does not have questions yet. Check back after the content finishes generating.
        </p>
      </div>
    );
  }

  const q = safeQuestions[current];
  const score = answers.filter((a, i) => a === safeQuestions[i].answer_index).length;

  function handleSelect(idx: number) {
    if (revealed) return;
    setSelected(idx);
  }

  function handleReveal() {
    if (selected === null) return;
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    setRevealed(true);
  }

  function handleNext() {
    if (current < safeQuestions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
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
    return (
      <div className="text-center py-10 animate-fade-up">
        <div className="text-5xl mb-4">{pct >= 80 ? "🎉" : pct >= 60 ? "📚" : "💪"}</div>
        <h2 className="font-display text-3xl font-bold mb-2">{score}/{safeQuestions.length}</h2>
        <p className="text-[#8888aa] font-body mb-2">{pct}% correct</p>
        <p className="text-sm font-body text-[#8888aa] mb-8">
          {pct >= 80 ? "Great work! You've got this chapter down." : pct >= 60 ? "Good effort - review the questions you missed." : "Keep studying - you'll get there!"}
        </p>

        <div className="space-y-2 max-w-lg mx-auto mb-8 text-left">
          {safeQuestions.map((question, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-start gap-3 p-3 rounded-xl text-sm font-body",
                answers[i] === question.answer_index ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
              )}
            >
              <span className="mt-0.5">{answers[i] === question.answer_index ? "✅" : "❌"}</span>
              <div>
                <p className="text-[#e8e8f0] mb-1">{question.question}</p>
                {answers[i] !== question.answer_index && (
                  <p className="text-[#8888aa]">Correct: {question.choices[question.answer_index]}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          className="px-8 py-3 rounded-xl font-body font-semibold text-sm text-white transition-all hover:scale-105"
          style={{ background: color }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(current / safeQuestions.length) * 100}%`, background: color }}
          />
        </div>
        <span className="text-[#8888aa] text-xs font-body font-mono">{current + 1}/{safeQuestions.length}</span>
      </div>

      <div className="p-6 rounded-2xl bg-[#111118] border border-[#1e1e2e] mb-4">
        <p className="font-body text-[#e8e8f0] text-base leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2 mb-6">
        {q.choices.map((choice, idx) => {
          const isCorrect = idx === q.answer_index;
          const isSelected = idx === selected;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={clsx(
                "w-full text-left px-5 py-3.5 rounded-xl border font-body text-sm transition-all",
                !revealed && !isSelected && "bg-[#111118] border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0]",
                !revealed && isSelected && "bg-[#6c63ff]/10 border-[#6c63ff]/50 text-[#e8e8f0]",
                revealed && isCorrect && "bg-green-500/10 border-green-500/40 text-green-400",
                revealed && !isCorrect && isSelected && "bg-red-500/10 border-red-500/40 text-red-400",
                revealed && !isCorrect && !isSelected && "bg-[#111118] border-[#1e1e2e] text-[#8888aa]"
              )}
            >
              <span className="font-mono text-xs mr-3 opacity-60">{["A", "B", "C", "D"][idx]}.</span>
              {choice.replace(/^[A-D]\)\s*/, "")}
            </button>
          );
        })}
      </div>

      {revealed && (
        <div className="p-4 rounded-xl bg-[#111118] border border-[#1e1e2e] mb-6 animate-fade-in">
          <p className="text-xs font-body font-medium text-[#8888aa] uppercase tracking-wider mb-2">Explanation</p>
          <p className="text-sm font-body text-[#c0c0d8] leading-relaxed">{q.explanation}</p>
        </div>
      )}

      <div className="flex gap-3">
        {!revealed ? (
          <button
            onClick={handleReveal}
            disabled={selected === null}
            className="flex-1 py-3 rounded-xl font-body font-semibold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:scale-[1.01]"
            style={{ background: color }}
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 py-3 rounded-xl font-body font-semibold text-sm text-white transition-all hover:scale-[1.01]"
            style={{ background: color }}
          >
            {current < safeQuestions.length - 1 ? "Next Question →" : "See Results →"}
          </button>
        )}
      </div>
    </div>
  );
}
