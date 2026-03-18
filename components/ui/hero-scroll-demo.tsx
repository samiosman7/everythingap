"use client";

import React from "react";
import { ArrowUpRight, BookOpenText, BrainCircuit, Calculator, FileChartColumnIncreasing } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const QUICK_ITEMS = [
  { icon: BookOpenText, label: "Read the chapter notes", desc: "The actual explanation, not just the answer key." },
  { icon: BrainCircuit, label: "Flip through flashcards", desc: "Facts, formulas, vocab, all in one rhythm." },
  { icon: FileChartColumnIncreasing, label: "Take the quiz", desc: "Quick check before class or before bed." },
  { icon: Calculator, label: "Work the hard math", desc: "Equations render cleanly instead of turning into nonsense." },
];

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[250px] pt-[150px] md:pb-[380px] md:pt-[300px]">
      <ContainerScroll
        titleComponent={
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#bab5ff]">Scroll into the platform</p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-7xl">
              Imagine opening your AP site
              <br />
              <span className="mt-1 block bg-gradient-to-r from-[#ffffff] via-[#d7d2ff] to-[#8b80ff] bg-clip-text font-bold leading-none text-transparent">
                and instantly knowing where to go.
              </span>
            </h2>
          </>
        }
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#09090f] text-white">
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80"
            alt="Student using laptop to study"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,15,0.46)_0%,rgba(8,8,15,0.82)_42%,rgba(8,8,15,1)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-8">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#b8b4d8]">Late-night study mode</p>
                <p className="mt-1 text-lg font-semibold text-white">Everything you need is already open.</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8b80ff]/30 bg-[#8b80ff]/15 px-3 py-1 text-xs font-medium text-[#ddd9ff]">
                AP Calculus AB
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.08fr,0.92fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.22em] text-[#b8b4d8]">Your next moves</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {QUICK_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="inline-flex rounded-xl bg-[#8b80ff]/12 p-2 text-[#d9d5ff]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#cbc8db]">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.22em] text-[#b8b4d8]">Inside this unit</p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      unit: "Limits and continuity",
                      status: "Notes, flashcards, quiz ready",
                    },
                    {
                      unit: "Derivatives and tangent lines",
                      status: "Worked examples and formulas cleanly rendered",
                    },
                    {
                      unit: "Applications of integration",
                      status: "Mock questions waiting when you are",
                    },
                  ].map((item, index) => (
                    <div
                      key={item.unit}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8b80ff]/18 text-sm font-semibold text-[#e5e2ff]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.unit}</p>
                          <p className="text-xs text-[#bdb9cf]">{item.status}</p>
                        </div>
                      </div>
                      <span className="text-xs text-[#d6d2eb]">Open</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
