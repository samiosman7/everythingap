"use client";

import { useState } from "react";
import clsx from "clsx";
import { Flashcard } from "@/types";

interface Props {
  cards: Flashcard[];
  color?: string;
}

export default function FlashcardDeck({ cards, color = "var(--accent)" }: Props) {
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
        <div className="mb-4 text-5xl font-display font-bold">Done</div>
        <h2 className="mb-2 font-display text-2xl font-bold">All reviewed</h2>
        <p className="mb-8 text-sm app-copy">You made it through all {cards.length} flashcards.</p>
        <button onClick={handleReset} className="app-primary-button px-8 py-3 text-sm">
          Start over
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <span className="text-xs app-muted">
          {reviewing.length} remaining · {known.size} known
        </span>
        <div className="flex gap-1">
          {cards.map((_, index) => (
            <div
              key={index}
              className={clsx(
                "h-1.5 w-1.5 rounded-full transition-all",
                known.has(index) ? "bg-green-500" : reviewing.includes(index) ? "opacity-60" : "opacity-30"
              )}
              style={{
                background: known.has(index)
                  ? undefined
                  : reviewing[current] === index
                    ? color
                    : "var(--line)",
              }}
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
            className="app-card flex min-h-[280px] w-full flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="mb-4 text-xs uppercase tracking-widest app-muted">Question</p>
            <p className="text-lg leading-relaxed">{card.question}</p>
            <p className="mt-6 text-xs app-muted">Tap to reveal the answer</p>
          </div>

          <div
            className="absolute inset-0 flex min-h-[280px] w-full flex-col items-center justify-center rounded-[22px] border p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "color-mix(in srgb, var(--accent-soft) 100%, var(--panel))",
              borderColor: "var(--line)",
            }}
          >
            <p className="mb-4 text-xs uppercase tracking-widest app-muted">Answer</p>
            <p className="text-base leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="mt-5 flex gap-3 animate-fade-up">
          <button onClick={handleStudyMore} className="app-secondary-button flex-1 py-3 text-sm font-semibold">
            Study more
          </button>
          <button onClick={handleKnow} className="app-primary-button flex-1 py-3 text-sm">
            Got it
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs app-muted">
        {current + 1} of {reviewing.length}
      </p>
    </div>
  );
}
