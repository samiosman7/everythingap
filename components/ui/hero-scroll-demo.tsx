"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpenText, Calculator, FileChartColumnIncreasing, Highlighter, Layers3 } from "lucide-react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

const QUICK_ITEMS = [
  { icon: BookOpenText, label: "Chapter notes", desc: "Read the explanation first." },
  { icon: FileChartColumnIncreasing, label: "Chapter quiz", desc: "Check whether it actually stuck." },
  { icon: Layers3, label: "Unit tools", desc: "Flashcards, key concepts, and the unit exam." },
  { icon: Calculator, label: "Math that renders cleanly", desc: "Formulas show up like formulas." },
];

const NOTE_SNIPPET = `# Introduction to Limits

## Big Idea
A limit describes the value a function approaches as the input gets close to a specific number. The function does not have to equal that value at the point itself.

## Worked Example
Evaluate lim(x -> 3) (x^2 - 9) / (x - 3)

Factor the numerator:
x^2 - 9 = (x - 3)(x + 3)

Now cancel the common factor:
(x - 3)(x + 3) / (x - 3) = x + 3

So the limit is 6.

## Why Students Miss It
- plugging in too early and stopping at 0/0
- forgetting to factor before simplifying
- confusing the limit with the actual function value`;

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-8 pt-2 sm:pb-12 sm:pt-4 md:pb-16 md:pt-8">
      <ContainerScroll
        titleComponent={
          <>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
              className="text-[11px] font-semibold uppercase tracking-[0.24em] sm:text-xs sm:tracking-[0.28em]"
              style={{ color: "var(--accent)" }}
            >
              Scroll into the actual product
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.72, delay: 0.08, ease: "easeOut" }}
              className="mt-3 text-3xl font-semibold sm:mt-4 sm:text-4xl md:text-7xl"
            >
              Open the app and land on
              <span className="mt-2 block font-bold leading-none" style={{ color: "var(--accent)" }}>
                something you can actually study from.
              </span>
            </motion.h2>
          </>
        }
      >
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-2xl" style={{ background: "linear-gradient(180deg, var(--bg-elevated), var(--bg))", color: "var(--text)" }}>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, color-mix(in srgb, var(--accent) 22%, transparent), transparent 24%), radial-gradient(circle at bottom left, rgba(255,255,255,0.05), transparent 28%)",
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between p-3 sm:p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-3 rounded-2xl border px-3 py-3 backdrop-blur-md sm:px-4 md:flex-row md:items-center md:justify-between"
              style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--panel) 76%, transparent)" }}
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                  AP Calculus AB · Unit 1
                </p>
                <p className="mt-1 text-base font-semibold sm:text-lg">Chapter notes open, quiz next, unit tools nearby.</p>
              </div>
              <div className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "var(--line)", background: "var(--accent-soft)", color: "var(--text)" }}>
                <Highlighter className="h-3.5 w-3.5" />
                Notes preview
              </div>
            </motion.div>

            <div className="grid gap-3 md:grid-cols-[1.08fr,0.92fr] md:gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="rounded-[24px] border p-3 backdrop-blur-md sm:p-4 md:rounded-[28px] md:p-5"
                style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--panel) 82%, transparent)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                  Notes snippet
                </p>
                <div
                  className="mt-3 rounded-2xl border p-4 font-mono text-[11px] leading-6 sm:text-xs md:mt-4 md:text-[13px]"
                  style={{ borderColor: "var(--line)", background: "var(--input)", color: "var(--text-soft)" }}
                >
                  <pre className="overflow-hidden whitespace-pre-wrap">{NOTE_SNIPPET}</pre>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="rounded-[24px] border p-3 backdrop-blur-md sm:p-4 md:rounded-[28px] md:p-5"
                style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--panel-strong) 78%, transparent)" }}
              >
                <p className="text-[10px] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                  Built around the actual flow
                </p>
                <div className="mt-3 grid gap-3 md:mt-4 md:grid-cols-2">
                  {QUICK_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.48, delay: index * 0.06, ease: "easeOut" }}
                        className="rounded-2xl border p-3 sm:p-4"
                        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg) 55%, transparent)" }}
                      >
                        <div className="inline-flex rounded-xl p-2" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <p className="mt-3 text-sm font-semibold">{item.label}</p>
                        <p className="mt-2 text-xs leading-5 sm:text-sm sm:leading-6" style={{ color: "var(--text-soft)" }}>
                          {item.desc}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
}
