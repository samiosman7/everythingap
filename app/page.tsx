"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Calculator,
  GraduationCap,
  Sparkles,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import GuestModeButton from "@/components/GuestModeButton";
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

const STUDENT_WINS = [
  {
    title: "Stop panic-switching tabs",
    desc: "Your notes, quizzes, flashcards, concepts, and mocks should live in one place. They do here.",
    icon: BookOpenText,
  },
  {
    title: "Actually understand the hard stuff",
    desc: "The goal is not just to memorize the answer. It is to understand what your teacher is trying to get you to see.",
    icon: Brain,
  },
  {
    title: "Practice like the real exam",
    desc: "When it is time to lock in, the AP-style questions and full mocks are already built into the flow.",
    icon: Target,
  },
];

const STUDENT_PRESSURES = [
  "You have three tests this week and two FRQs due tomorrow.",
  "You remember the unit name but not where the quiz went.",
  "You understand half the lesson and the other half feels like static.",
  "You need examples, not another vague summary.",
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    setIsGuest(document.cookie.includes(`${GUEST_COOKIE_NAME}=1`));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07070b] text-[#f3f0ff]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(108,99,255,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(39,181,255,0.08),transparent_22%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.05),transparent_30%)]" />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#07070b]/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Everything<span className="text-[#8b80ff]">AP</span>
          </span>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {user || isGuest ? (
              <Link
                href="/dashboard"
                className="rounded-2xl bg-[#8b80ff] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#9a90ff]"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="rounded-2xl px-4 py-2 text-sm font-medium text-[#bcb7d9] transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="rounded-2xl bg-[#8b80ff] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#9a90ff]"
                >
                  Start studying
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  label="Try guest mode"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#ece9fb] transition-colors hover:border-[#8b80ff]/40 hover:bg-white/10"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-24">
        <section className="px-6 pb-8 pt-10 md:pb-12 md:pt-16">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8b80ff]/30 bg-[#8b80ff]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#cbc6ff]">
                <Sparkles className="h-4 w-4" />
                Built for the student who is juggling everything
              </div>

              <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.92] text-white md:text-7xl">
                You already have enough stress.
                <span className="mt-2 block bg-gradient-to-r from-white via-[#ddd8ff] to-[#8b80ff] bg-clip-text text-transparent">
                  Your AP prep should not be one of them.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#b6b2cc]">
                This site is for the nights when you are trying to relearn a whole unit, for the mornings when you need a
                last-minute quiz run, and for the weeks when every class decides to be difficult at the same time.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8b80ff] px-7 py-4 text-base font-semibold text-white transition-all hover:bg-[#9a90ff]"
                >
                  Pick my AP classes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-base font-medium text-[#ece9fb] transition-colors hover:border-[#8b80ff]/40 hover:bg-white/10"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {STUDENT_PRESSURES.map((line, index) => (
                <div
                  key={line}
                  className={`rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl ${
                    index === 0 || index === 3 ? "md:translate-y-8" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8b80ff]/16 text-sm font-bold text-[#ddd8ff]">
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-lg font-medium leading-8 text-[#f4f1ff]">{line}</p>
                  <p className="mt-3 text-sm leading-7 text-[#9f9bb6]">
                    Everything AP is supposed to make that moment feel less chaotic, not more.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative px-6 pb-4 pt-4">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#bdb8ff]">Main event</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-white md:text-6xl">
                Scroll through it like a student discovering the site five minutes before a study session.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#a9a5bf]">
                The whole point is that you should feel the product immediately. Not read a wall of startup copy. Not guess
                what is inside. Just scroll, see the workflow, and know where your next click should go.
              </p>
            </div>
          </div>
          <HeroScrollDemo />
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-2">
          <div className="grid gap-5 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-3 text-[#d8d3ff]">
                <GraduationCap className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">What you actually need</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STUDENT_WINS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                      <div className="inline-flex rounded-2xl bg-[#8b80ff]/12 p-3 text-[#cfcaff]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 font-display text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#a6a2ba]">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[34px] border border-[#2a2555] bg-[linear-gradient(160deg,#131226_0%,#0d0d15_52%,#09090f_100%)] p-7">
              <div className="flex items-center gap-3 text-[#d8d3ff]">
                <Calculator className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">For the hard subjects too</span>
              </div>
              <h3 className="mt-5 font-display text-3xl font-bold text-white">
                Math should render like math.
              </h3>
              <p className="mt-4 text-sm leading-7 text-[#aaa6c0]">
                Limits, derivatives, integrals, statistics formulas, chemistry notation, and all the ugly escaped symbols
                should show up cleanly instead of breaking your notes page.
              </p>

              <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-5 font-mono text-sm text-[#efeaff]">
                <div className="text-[#8f89b5]">Now supported cleanly:</div>
                <div className="mt-3 space-y-2">
                  <div>{"$\\lim_{x \\to 3} \\frac{x^2 - 9}{x - 3} = 6$"}</div>
                  <div>{"$$\\int_0^1 x^2\\,dx = \\frac{1}{3}$$"}</div>
                  <div>{"$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
