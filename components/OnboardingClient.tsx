"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles, Users } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Course } from "@/types";
import GuestModeButton from "@/components/GuestModeButton";
import { groupCoursesByCategory } from "@/lib/course-display";
import { saveSelectedCourseIds } from "@/lib/course-preferences";

type OnboardingClientProps = {
  continueHref?: string;
  allowGuest?: boolean;
};

export default function OnboardingClient({
  continueHref = "/sign-up",
  allowGuest = true,
}: OnboardingClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("courses")
      .select("id, slug, name, color, accent, emoji")
      .order("name")
      .then(({ data }) => {
        setCourses(data ?? []);
        setLoading(false);
      });
  }, []);

  const groupedCourses = useMemo(() => groupCoursesByCategory(courses), [courses]);

  function toggleCourse(courseId: string) {
    setSelectedIds(current =>
      current.includes(courseId)
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
    );
  }

  function handleContinue() {
    saveSelectedCourseIds(selectedIds);
    router.push(continueHref);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 text-[#e8e8f0]">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="grid gap-4 rounded-[32px] border border-[#1e1e2e] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.25),_transparent_42%),linear-gradient(180deg,#111118_0%,#0c0c13_100%)] p-8 lg:grid-cols-[1.3fr,0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-4 py-1.5 text-xs font-body uppercase tracking-[0.2em] text-[#b7b2ff]">
              <Users className="h-4 w-4" />
              Welcome to EverythingAP
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              Build your AP dashboard in under a minute.
            </h1>
            <p className="mt-4 max-w-2xl text-base font-body leading-8 text-[#b1b1cb]">
              Choose the AP classes you&apos;re taking and we&apos;ll surface the right notes, flashcards, key concepts,
              quizzes, and mock exams right away instead of making you dig for them.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#6c63ff] px-6 py-3.5 font-body text-sm font-semibold text-white transition-all hover:bg-[#7c73ff]"
              >
                Save selections and continue
                <ArrowRight className="h-4 w-4" />
              </button>
              {allowGuest && (
                <GuestModeButton
                  label="Continue as guest"
                  className="rounded-2xl border border-[#2a2a3a] bg-[#111118] px-6 py-3.5 font-body text-sm font-medium text-[#e8e8f0] transition-colors hover:border-[#6c63ff]/30"
                />
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#222233] bg-[#0d0d14]/90 p-6">
            <div className="flex items-center gap-2 text-[#9d96ff]">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-body uppercase tracking-[0.2em]">What you unlock</p>
            </div>
            <div className="mt-5 space-y-4">
              {[
                "Teacher-style chapter notes with clearer math and worked examples",
                "Flashcards, key concepts, quizzes, unit exams, and full AP mocks",
                "A cleaner dashboard organized around the courses you actually take",
              ].map(item => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#1e1e2e] bg-[#111118] p-4">
                  <div className="mt-0.5 rounded-full bg-[#6c63ff]/12 p-1 text-[#b7b2ff]">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-sm font-body leading-6 text-[#d9d9ec]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Choose your AP classes</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Pick everything you&apos;re taking this year</h2>
            </div>
            <p className="text-sm font-body text-[#8c8cab]">{selectedIds.length} selected</p>
          </div>

          {loading ? (
            <p className="text-sm font-body text-[#8888aa]">Loading courses...</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedCourses).map(([category, items]) => (
                <div key={category}>
                  <h3 className="mb-4 font-display text-xl font-semibold">{category}</h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map(course => {
                      const active = selectedIds.includes(course.id);
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() => toggleCourse(course.id)}
                          className={`rounded-[22px] border p-4 text-left transition-all ${
                            active
                              ? "border-[#6c63ff]/55 bg-[#161625] shadow-[0_0_0_1px_rgba(108,99,255,0.25)]"
                              : "border-[#1e1e2e] bg-[#0d0d14] hover:border-[#2b2b42]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl"
                              style={{ background: `${course.color}22` }}
                            >
                              <span aria-hidden="true">{course.emoji}</span>
                            </div>
                            {active && (
                              <span className="rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-2 py-1 text-[11px] font-body uppercase tracking-[0.18em] text-[#c9c6ff]">
                                Selected
                              </span>
                            )}
                          </div>
                          <h4 className="mt-4 font-display text-lg font-semibold text-[#f3f3fb]">{course.name}</h4>
                          <p className="mt-2 text-sm font-body leading-6 text-[#8a8aa5]">
                            One hub for notes, flashcards, quizzes, key concepts, and exam prep.
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t border-[#1e1e2e] pt-6 sm:flex-row">
            <button
              type="button"
              onClick={handleContinue}
              className="rounded-2xl bg-[#6c63ff] px-6 py-3.5 font-body text-sm font-semibold text-white transition-colors hover:bg-[#7c73ff]"
            >
              Continue with {selectedIds.length || "your"} courses
            </button>
            <Link
              href="/"
              className="rounded-2xl border border-[#2a2a3a] px-6 py-3.5 text-center font-body text-sm font-medium text-[#d9d9ec] transition-colors hover:border-[#6c63ff]/30"
            >
              Go back
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
