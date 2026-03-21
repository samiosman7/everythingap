"use client";

import { useState } from "react";
import clsx from "clsx";
import { Flashcard } from "@/types";

interface Props {
  cards: Flashcard[];
  color?: string;
}

export default function FlashcardDeck({ cards, color = "#6c63ff" }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [reviewing, setReviewing] = useState<number[]>(cards.map((_, index) => index));

  const cardIndex = reviewing[current];
  const card = cards[cardIndex];
  const done = reviewing.length === 0;

  function handleFlip() {
    setFlipped(value => !value);
  }

  function handleKnow() {
    const nextKnown = new Set(known);
    nextKnown.add(cardIndex);
    setKnown(nextKnown);
    advance(true);
  }

  function handleStudyMore() {
    advance(false);
  }

  function advance(removeCard: boolean) {
    setFlipped(false);

    if (removeCard) {
      const nextReviewing = reviewing.filter((_, index) => index !== current);
      setReviewing(nextReviewing);
      if (current >= nextReviewing.length) {
        setCurrent(Math.max(0, nextReviewing.length - 1));
      }
      return;
    }

    setCurrent(index => (index + 1) % reviewing.length);
  }

  function handleReset() {
    setCurrent(0);
    setFlipped(false);
    setKnown(new Set());
    setReviewing(cards.map((_, index) => index));
  }

  if (done) {
    return (
      <div className="animate-fade-up py-10 text-center">
        <div className="mb-4 text-5xl font-display font-bold text-white">Done</div>
        <h2 className="mb-2 font-display text-2xl font-bold">All reviewed</h2>
        <p className="mb-8 font-body text-[#8888aa]">You made it through all {cards.length} flashcards.</p>
        <button
          onClick={handleReset}
          className="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: color }}
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs font-body text-[#8888aa]">
          {reviewing.length} remaining • {known.size} known
        </span>
        <div className="flex gap-1">
          {cards.map((_, index) => (
            <div
              key={index}
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-all",
                known.has(index) ? "bg-green-500" : reviewing.includes(index) ? "bg-[#2a2a3a]" : "bg-[#1e1e2e]"
              )}
              style={reviewing[current] === index ? { background: color } : undefined}
            />
          ))}
        </div>
      </div>

      <div onClick={handleFlip} className="relative cursor-pointer select-none" style={{ perspective: "1000px" }}>
        <div
          className="relative transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <div
            className="flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border border-[#1e1e2e] bg-[#111118] p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="mb-4 text-xs font-body uppercase tracking-widest text-[#8888aa]">Question</p>
            <p className="text-lg leading-relaxed text-[#e8e8f0]">{card.question}</p>
            <p className="mt-6 text-xs font-body text-[#3a3a4a]">Tap to reveal the answer</p>
          </div>

          <div
            className="absolute inset-0 flex min-h-[280px] w-full flex-col items-center justify-center rounded-2xl border p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: `${color}10`,
              borderColor: `${color}30`,
            }}
          >
            <p className="mb-4 text-xs font-body uppercase tracking-widest text-[#8888aa]">Answer</p>
            <p className="text-base leading-relaxed text-[#e8e8f0]">{card.answer}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="mt-5 flex gap-3 animate-fade-up">
          <button
            onClick={handleStudyMore}
            className="flex-1 rounded-xl border border-[#1e1e2e] bg-[#111118] py-3 text-sm font-semibold text-[#e8e8f0] transition-all hover:border-[#2a2a3a]"
          >
            Study more
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:scale-[1.01]"
            style={{ background: color }}
          >
            Got it
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs font-body text-[#3a3a4a]">
        {current + 1} of {reviewing.length}
      </p>
    </div>
  );
}
