"use client";
import { useState } from "react";
import { Flashcard } from "@/types";
import clsx from "clsx";

interface Props { cards: Flashcard[]; color?: string; }

export default function FlashcardDeck({ cards, color = "#6c63ff" }: Props) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [reviewing, setReviewing] = useState<number[]>(cards.map((_, i) => i));

  const cardIdx = reviewing[current];
  const card = cards[cardIdx];
  const done = reviewing.length === 0;

  function handleFlip() { setFlipped(f => !f); }

  function handleKnow() {
    const newKnown = new Set(known);
    newKnown.add(cardIdx);
    setKnown(newKnown);
    advance(true);
  }

  function handleStudyMore() { advance(false); }

  function advance(removeCard: boolean) {
    setFlipped(false);
    if (removeCard) {
      const newReviewing = reviewing.filter((_, i) => i !== current);
      setReviewing(newReviewing);
      if (current >= newReviewing.length) setCurrent(Math.max(0, newReviewing.length - 1));
    } else {
      setCurrent(c => (c + 1) % reviewing.length);
    }
  }

  function handleReset() {
    setCurrent(0);
    setFlipped(false);
    setKnown(new Set());
    setReviewing(cards.map((_, i) => i));
  }

  if (done) {
    return (
      <div className="text-center py-10 animate-fade-up">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="font-display text-2xl font-bold mb-2">All done!</h2>
        <p className="text-[#8888aa] font-body mb-8">You reviewed all {cards.length} flashcards.</p>
        <button
          onClick={handleReset}
          className="px-8 py-3 rounded-xl font-body font-semibold text-sm text-white transition-all hover:scale-105"
          style={{ background: color }}
        >
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[#8888aa] text-xs font-body">{reviewing.length} remaining · {known.size} known</span>
        <div className="flex gap-1">
          {cards.map((_, i) => (
            <div key={i} className={clsx(
              "w-1.5 h-1.5 rounded-full transition-all",
              known.has(i) ? "bg-green-500" : reviewing.includes(i) ? "bg-[#2a2a3a]" : "bg-[#1e1e2e]"
            )} style={reviewing[current] === i ? { background: color } : {}} />
          ))}
        </div>
      </div>

      {/* Card */}
      <div
        onClick={handleFlip}
        className="relative cursor-pointer select-none"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative transition-transform duration-500"
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div
            className="w-full min-h-[280px] rounded-2xl bg-[#111118] border border-[#1e1e2e] flex flex-col items-center justify-center p-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs font-body text-[#8888aa] uppercase tracking-widest mb-4">Question</p>
            <p className="font-body text-lg text-[#e8e8f0] leading-relaxed">{card.question}</p>
            <p className="text-xs font-body text-[#3a3a4a] mt-6">Tap to reveal answer</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 w-full min-h-[280px] rounded-2xl border flex flex-col items-center justify-center p-8 text-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: `${color}10`,
              borderColor: `${color}30`,
            }}
          >
            <p className="text-xs font-body text-[#8888aa] uppercase tracking-widest mb-4">Answer</p>
            <p className="font-body text-base text-[#e8e8f0] leading-relaxed">{card.answer}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {flipped && (
        <div className="flex gap-3 mt-5 animate-fade-up">
          <button
            onClick={handleStudyMore}
            className="flex-1 py-3 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] font-body font-semibold text-sm text-[#e8e8f0] transition-all"
          >
            Study More 🔄
          </button>
          <button
            onClick={handleKnow}
            className="flex-1 py-3 rounded-xl font-body font-semibold text-sm text-white transition-all hover:scale-[1.01]"
            style={{ background: color }}
          >
            Got It ✓
          </button>
        </div>
      )}

      <p className="text-center text-xs font-body text-[#3a3a4a] mt-4">{current + 1} of {reviewing.length}</p>
    </div>
  );
}
