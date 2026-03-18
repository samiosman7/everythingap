"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { ArrowRight, Brain, Clock3, Layers3, Sparkles, Target } from "lucide-react";
import GuestModeButton from "@/components/GuestModeButton";
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";
import ResumeWhereLeftOff from "@/components/ResumeWhereLeftOff";

const STUDENT_REASONS = [
  {
    title: "It keeps your place for you",
    desc: "If you stop mid-unit, the app can bring you back to the exact course, unit, chapter, or study tool you were using.",
    icon: Clock3,
  },
  {
    title: "It feels organized instead of chaotic",
    desc: "Course hubs lead into unit hubs, and unit hubs lead into the next clear step. You should never wonder where the quiz went.",
    icon: Layers3,
  },
  {
    title: "It is built for real AP pressure",
    desc: "Notes, flashcards, chapter quizzes, unit exams, and full mocks are all in one workflow instead of scattered tabs.",
    icon: Target,
  },
];

const STUDENT_MOMENTS = [
  "You forgot what chapter you were on and do not want to re-click through everything.",
  "You need notes first, then a quiz, then maybe flashcards if it still is not sticking.",
  "You want to see progress without turning studying into some weird corporate dashboard.",
  "You need an app that feels calmer than your workload does.",
];

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setIsGuest(document.cookie.includes(`${GUEST_COOKIE_NAME}=1`));
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#07070b] text-[#f3f0ff]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(108,99,255,0.18),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(39,181,255,0.08),transparent_22%),radial-gradient(circle_at_45%_82%,rgba(255,255,255,0.05),transparent_32%)]" />

      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#07070b]/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-display text-lg font-extrabold tracking-tight text-white">
            Everything<span className="text-[#8b80ff]">AP</span>
          </span>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
            {isSignedIn || isGuest ? (
              <Link
                href="/dashboard"
                className="flex-1 rounded-2xl bg-[#8b80ff] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#9a90ff] sm:flex-none"
              >
                Open dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="rounded-2xl px-3 py-2 text-sm font-medium text-[#bcb7d9] transition-colors hover:text-white sm:px-4"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding"
                  className="flex-1 rounded-2xl bg-[#8b80ff] px-4 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-[#9a90ff] sm:flex-none"
                >
                  Start studying
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  label="Try guest mode"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-center text-sm font-medium text-[#ece9fb] transition-colors hover:border-[#8b80ff]/40 hover:bg-white/10 sm:w-auto"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="relative pt-36 sm:pt-28">
        <section className="px-4 pb-8 pt-8 sm:px-6 md:pb-12 md:pt-16">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr,1.05fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#8b80ff]/30 bg-[#8b80ff]/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#cbc6ff]">
                <Sparkles className="h-4 w-4" />
                Built for students who are doing too much at once
              </div>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[0.95] text-white sm:text-5xl md:text-7xl">
                Studying for AP classes should feel
                <span className="mt-2 block bg-gradient-to-r from-white via-[#ddd8ff] to-[#8b80ff] bg-clip-text text-transparent">
                  organized, obvious, and doable.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-[#b6b2cc] sm:text-lg">
                EverythingAP is meant to feel good to use when school feels bad. Open your class, see your next move, and
                keep going without wasting energy figuring out where your notes, quizzes, or flashcards went.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8b80ff] px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[#9a90ff]"
                >
                  Choose my AP classes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-medium text-[#ece9fb] transition-colors hover:border-[#8b80ff]/40 hover:bg-white/10"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {STUDENT_MOMENTS.map((line, index) => (
                <div
                  key={line}
                  className={`rounded-[24px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[28px] ${
                    index === 0 || index === 3 ? "md:translate-y-8" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8b80ff]/16 text-sm font-bold text-[#ddd8ff]">
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-lg font-medium leading-8 text-[#f4f1ff]">{line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <ResumeWhereLeftOff />
        </section>

        <section className="relative px-4 pb-6 pt-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#bdb8ff]">See the flow</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl md:text-6xl">
                The scroll should show you the product in the order a student actually experiences it.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#a9a5bf]">
                You should be able to land here, scroll once, and instantly get the point: your prep is organized, your
                place is saved, and the next thing to do is obvious.
              </p>
            </div>
          </div>
          <HeroScrollDemo />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 pt-2 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-7">
              <div className="flex items-center gap-3 text-[#d8d3ff]">
                <Brain className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">Why students actually like it</span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {STUDENT_REASONS.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
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

            <div className="rounded-[28px] border border-[#2a2555] bg-[linear-gradient(160deg,#131226_0%,#0d0d15_52%,#09090f_100%)] p-5 sm:p-7">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8d3ff]">The promise</div>
              <h3 className="mt-4 font-display text-3xl font-bold text-white">Less hunting. Less friction. More studying.</h3>
              <p className="mt-4 text-sm leading-8 text-[#aaa6c0]">
                The best version of this app is the one that gets out of your way. It should make it easier to start,
                easier to continue, and easier to finish a unit than it was yesterday.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Resume where you left off instead of restarting your search.",
                  "See real progress across chapters and unit tools.",
                  "Move through a cleaner course → unit → chapter system.",
                ].map(item => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-[#efeaff]">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
