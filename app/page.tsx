"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpenText, BrainCircuit, FileChartColumnIncreasing, GraduationCap, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import GuestModeButton from "@/components/GuestModeButton";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

const FEATURE_PILLARS = [
  {
    title: "Understand it",
    desc: "Teacher-style notes that explain the why, not just the answer.",
    icon: BookOpenText,
  },
  {
    title: "Memorize it",
    desc: "Flashcards and key concepts for the terms, formulas, and facts that matter.",
    icon: BrainCircuit,
  },
  {
    title: "Test it",
    desc: "Chapter quizzes, unit exams, and full AP-style mocks in one flow.",
    icon: FileChartColumnIncreasing,
  },
];

const TESTIMONIALS = [
  { name: "Sami", role: "AP Calculus student", quote: "I need everything in one place, not hidden across random tabs." },
  { name: "Alex", role: "APUSH + AP Lang", quote: "The course hub makes it obvious where the notes, quizzes, and exam prep live." },
  { name: "Jordan", role: "AP Bio + AP Chem", quote: "Choosing my courses first makes the dashboard finally feel organized." },
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
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0f] text-[#e8e8f0]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#1e1e2e] bg-[#0a0a0f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <span className="font-display text-lg font-bold tracking-tight">
            Everything<span className="text-[#6c63ff]">AP</span>
          </span>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {user || isGuest ? (
              <Link href="/dashboard" className="rounded-xl bg-[#6c63ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7c73ff]">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="rounded-xl px-4 py-2 text-sm font-medium text-[#b3b3cd] transition-colors hover:text-white">
                  Sign in
                </Link>
                <Link href="/onboarding" className="rounded-xl bg-[#6c63ff] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#7c73ff]">
                  Pick my APs
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  label="Guest mode"
                  className="rounded-xl border border-[#26263a] bg-[#111118] px-4 py-2 text-sm font-medium text-[#e8e8f0] transition-colors hover:border-[#6c63ff]/35"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <section className="relative px-6 pb-16 pt-10">
          <div className="absolute left-1/2 top-12 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#6c63ff]/12 blur-[140px]" />
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.25fr,0.95fr]">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-[#b7b2ff]">
                <Users2 className="h-4 w-4" />
                Built around how students actually study
              </div>
              <h1 className="mt-6 max-w-4xl font-display text-5xl font-extrabold leading-[0.95] md:text-7xl">
                AP prep that finally
                <span className="block bg-gradient-to-r from-[#ffffff] via-[#bfb9ff] to-[#7a6fff] bg-clip-text text-transparent">
                  shows you everything.
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg font-body leading-8 text-[#a7a7c3]">
                Choose the AP classes you&apos;re taking, land on a clean dashboard, and jump straight into notes,
                flashcards, key concepts, quizzes, unit exams, and full AP mock exams without hunting around.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#6c63ff] px-7 py-4 text-base font-semibold text-white transition-all hover:bg-[#7c73ff]">
                  Start with my AP classes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  className="rounded-2xl border border-[#26263a] px-7 py-4 text-base font-medium text-[#e8e8f0] transition-colors hover:border-[#6c63ff]/35 hover:bg-[#111118]"
                />
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                {FEATURE_PILLARS.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-[#1e1e2e] bg-[#111118]/80 p-4">
                      <Icon className="h-5 w-5 text-[#9d96ff]" />
                      <h3 className="mt-3 font-display text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm font-body leading-6 text-[#8c8cab]">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-[32px] border border-[#1e1e2e] bg-[linear-gradient(180deg,#12121a_0%,#0b0b11_100%)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="rounded-[26px] border border-[#1f1f2d] bg-[#0b0b11] p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Welcome flow</p>
                      <h2 className="mt-2 font-display text-2xl font-bold">Pick your AP lineup first</h2>
                    </div>
                    <div className="rounded-2xl bg-[#6c63ff]/12 p-3 text-[#bdb8ff]">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      "Choose the AP classes you're taking this year",
                      "See your selected classes first on the dashboard",
                      "Open a course hub where notes, flashcards, quizzes, and exams are all obvious",
                    ].map((line, index) => (
                      <div key={line} className="flex items-start gap-3 rounded-2xl border border-[#1e1e2e] bg-[#111118] p-4">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6c63ff]/14 text-xs font-semibold text-[#cfcaff]">
                          {index + 1}
                        </div>
                        <p className="text-sm font-body leading-6 text-[#d6d6ea]">{line}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {TESTIMONIALS.map(person => (
                    <div key={person.name} className="rounded-2xl border border-[#1e1e2e] bg-[#111118] p-4">
                      <p className="text-sm font-body leading-6 text-[#dbdbef]">&ldquo;{person.quote}&rdquo;</p>
                      <div className="mt-4">
                        <p className="font-display text-sm font-semibold">{person.name}</p>
                        <p className="text-xs font-body uppercase tracking-[0.18em] text-[#777795]">{person.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">What's inside</p>
            <h2 className="mt-2 font-display text-4xl font-bold">A clearer AP study experience from the moment you land.</h2>
            <p className="mt-4 text-base font-body leading-8 text-[#8f8fac]">
              No hidden sections. No guessing where quizzes live. No course grid that makes every class look the same.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Course hubs", "Each course opens into one clear home for notes, flashcards, key concepts, quizzes, and exams."],
              ["Selected courses first", "Your dashboard starts with the AP classes you actually care about, then shows everything else by category."],
              ["Guest mode", "Explore the full product before signing up, without saving progress."],
              ["Math-friendly notes", "LaTeX, display equations, and cleaned-up symbols render far more reliably in note pages."],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-[24px] border border-[#1e1e2e] bg-[#111118] p-5">
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm font-body leading-7 text-[#8f8fac]">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
