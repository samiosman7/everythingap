"use client";

import React from "react";
import { BookOpenText, BrainCircuit, FileChartColumnIncreasing } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const QUICK_ITEMS = [
  { icon: BookOpenText, label: "Teacher notes", tone: "bg-[#6c63ff]/12 text-[#c8c5ff]" },
  { icon: BrainCircuit, label: "Flashcards", tone: "bg-[#0e7490]/12 text-[#8ee4ff]" },
  { icon: FileChartColumnIncreasing, label: "AP-style exams", tone: "bg-[#16a34a]/12 text-[#b3f5c3]" },
];

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[280px] pt-[220px] md:pb-[420px] md:pt-[420px]">
      <ContainerScroll
        titleComponent={
          <>
            <p className="text-xs font-body uppercase tracking-[0.28em] text-[#9d96ff]">
              See The Platform
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-white md:text-6xl">
              Scroll into the study dashboard
              <br />
              <span className="mt-1 block bg-gradient-to-r from-[#ffffff] via-[#d2ceff] to-[#8b80ff] bg-clip-text font-bold leading-none text-transparent">
                before you even sign up.
              </span>
            </h2>
          </>
        }
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl bg-[#09090f] text-white">
          <img
            src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80"
            alt="Students studying together"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,15,0.55)_0%,rgba(8,8,15,0.86)_40%,rgba(8,8,15,1)_100%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-8">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#b8b4d8]">Everything AP</p>
                <p className="mt-1 text-lg font-semibold text-white">Your course hub at a glance</p>
              </div>
              <div className="rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/15 px-3 py-1 text-xs font-medium text-[#ddd9ff]">
                AP Calculus AB
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.22em] text-[#b8b4d8]">What opens up</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {QUICK_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className={`inline-flex rounded-xl p-2 ${item.tone}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold text-white">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-[#cbc8db]">
                          No hidden tabs. Open the exact study tool you need right away.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/30 p-5 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.22em] text-[#b8b4d8]">Inside a unit</p>
                <div className="mt-4 space-y-3">
                  {[
                    "Limits & Continuity",
                    "Differentiation: Definition & Properties",
                    "Applications of Integration",
                  ].map((unit, index) => (
                    <div
                      key={unit}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/6 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6c63ff]/18 text-sm font-semibold text-[#e5e2ff]">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{unit}</p>
                          <p className="text-xs text-[#bdb9cf]">Notes, flashcards, concepts, quiz</p>
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
