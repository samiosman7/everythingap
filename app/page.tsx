"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, BookOpenText, Layers3, Sparkles, Target } from "lucide-react";
import GuestModeButton from "@/components/GuestModeButton";
import { HeroScrollDemo } from "@/components/ui/hero-scroll-demo";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

const REASONS = [
  {
    icon: BookOpenText,
    title: "Notes that actually help",
    copy: "Open a chapter and get a real explanation, worked examples, and cleaner formatting instead of a wall of junk text.",
  },
  {
    icon: Layers3,
    title: "A cleaner study flow",
    copy: "Course hub to unit hub to chapter notes to practice. It stays organized instead of making you guess where everything went.",
  },
  {
    icon: Target,
    title: "Built for actual AP prep",
    copy: "Chapter quizzes, flashcards, key concepts, unit exams, and full mocks all sit in one place.",
  },
];

export default function HomePage() {
  const { isSignedIn } = useUser();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    setIsGuest(document.cookie.includes(`${GUEST_COOKIE_NAME}=1`));
  }, []);

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 88%, transparent)" }}
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="font-display text-lg font-extrabold tracking-tight">
            Everything<span style={{ color: "var(--accent)" }}>AP</span>
          </span>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
            <Link href="/sign-in" className="px-3 py-2 text-sm font-medium" style={{ color: "var(--text-soft)" }}>
              Sign in
            </Link>
            <Link href="/sign-up" className="px-3 py-2 text-sm font-medium" style={{ color: "var(--text-soft)" }}>
              Sign up
            </Link>
            {isSignedIn ? (
              <Link href="/dashboard" className="app-primary-button flex-1 px-4 py-2.5 text-center text-sm sm:flex-none">
                Open dashboard
              </Link>
            ) : isGuest ? (
              <>
                <Link href="/dashboard" className="app-primary-button flex-1 px-4 py-2.5 text-center text-sm sm:flex-none">
                  Resume guest mode
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
                    setIsGuest(false);
                  }}
                  className="app-secondary-button w-full px-4 py-2.5 text-center text-sm font-medium sm:w-auto"
                >
                  Exit guest mode
                </button>
              </>
            ) : (
              <>
                <Link href="/onboarding" className="app-primary-button flex-1 px-4 py-2.5 text-center text-sm sm:flex-none">
                  Start studying
                </Link>
                <GuestModeButton
                  href="/onboarding"
                  label="Try guest mode"
                  className="app-secondary-button w-full px-4 py-2.5 text-center text-sm font-medium sm:w-auto"
                />
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="app-page pb-16 pt-8 sm:pt-10">
        <section className="mx-auto max-w-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="mb-6 max-w-4xl"
          >
            <div
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ borderColor: "var(--line)", background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <Sparkles className="h-4 w-4" />
              Study in one clean system
            </div>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[0.95] sm:text-5xl md:text-7xl">
              One place for your AP notes,
              <span className="mt-2 block" style={{ color: "var(--accent)" }}>
                quizzes, flashcards, exams, and progress.
              </span>
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 app-copy sm:text-lg">
              The point is simple: open your class, know where you are, and keep moving. No scattered tabs. No hunting for the next step. No ugly dashboard energy.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {isSignedIn ? (
                <Link href="/dashboard" className="app-primary-button inline-flex items-center justify-center gap-2 px-6 py-4 text-base">
                  Open my dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : isGuest ? (
                <>
                  <Link href="/dashboard" className="app-primary-button inline-flex items-center justify-center gap-2 px-6 py-4 text-base">
                    Resume guest mode
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/sign-up" className="app-secondary-button px-6 py-4 text-base font-medium">
                    Save my progress with an account
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/onboarding" className="app-primary-button inline-flex items-center justify-center gap-2 px-6 py-4 text-base">
                    Choose my AP classes
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <GuestModeButton href="/onboarding" className="app-secondary-button px-6 py-4 text-base font-medium" />
                </>
              )}
            </div>
          </motion.div>

          <HeroScrollDemo />
        </section>

        <section className="mx-auto mt-4 grid max-w-[1400px] gap-4 lg:grid-cols-3">
          {REASONS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="app-panel p-6"
              >
                <div className="inline-flex rounded-2xl p-3" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 app-copy">{item.copy}</p>
              </motion.div>
            );
          })}
        </section>
      </main>
    </div>
  );
}
