"use client";
import { useState } from "react";
import { FRQ } from "@/types";

interface Props { questions: FRQ[]; }

export default function FRQViewer({ questions }: Props) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {questions.map((frq, i) => (
        <div key={i} className="rounded-2xl bg-[#111118] border border-[#1e1e2e] overflow-hidden">
          <div className="p-5">
            <div className="text-xs font-body text-[#8888aa] uppercase tracking-widest mb-2">FRQ {i + 1}</div>
            <p className="font-body text-[#e8e8f0] text-sm leading-relaxed">{frq.question}</p>
          </div>
          <div className="border-t border-[#1e1e2e]">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-3 text-left text-xs font-body text-[#8888aa] hover:text-[#e8e8f0] flex items-center justify-between transition-colors"
            >
              <span>View Rubric & Sample Response</span>
              <span>{open === i ? "▲" : "▼"}</span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 space-y-4 animate-fade-in">
                <div>
                  <p className="text-xs font-body font-medium text-[#6c63ff] uppercase tracking-wider mb-2">Scoring Rubric</p>
                  <p className="text-sm font-body text-[#c0c0d8] leading-relaxed whitespace-pre-line">{frq.rubric}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-medium text-green-400 uppercase tracking-wider mb-2">Sample High-Scoring Response</p>
                  <p className="text-sm font-body text-[#c0c0d8] leading-relaxed whitespace-pre-line">{frq.sample_response}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
