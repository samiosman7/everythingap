"use client";

import { useState } from "react";
import { FRQ } from "@/types";

interface Props {
  questions: FRQ[];
}

export default function FRQViewer({ questions }: Props) {
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const [open, setOpen] = useState<number | null>(null);

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

  return (
    <div className="space-y-4">
      {safeQuestions.map((frq, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border border-[#1e1e2e] bg-[#111118]">
          <div className="p-5">
            <div className="mb-2 text-xs font-body uppercase tracking-widest text-[#8888aa]">FRQ {index + 1}</div>
            <p className="text-sm leading-relaxed text-[#e8e8f0]">{frq.question}</p>
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
              <div className="animate-fade-in space-y-4 px-5 pb-5">
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
      ))}
    </div>
  );
}
