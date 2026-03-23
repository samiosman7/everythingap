"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, GraduationCap, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Course } from "@/types";
import GuestModeButton from "@/components/GuestModeButton";
import { groupCoursesByCategory } from "@/lib/course-display";
import { saveSelectedCourseIds } from "@/lib/course-preferences";
import { buildTutorialTargets, createTutorialState, saveTutorialState } from "@/lib/tutorial";

type OnboardingClientProps = {
  continueHref?: string;
  allowGuest?: boolean;
  tutorialMode?: boolean;
};

export default function OnboardingClient({
  continueHref = "/sign-up",
  allowGuest = true,
  tutorialMode = false,
}: OnboardingClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [continuing, setContinuing] = useState(false);

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
      current.includes(courseId) ? current.filter(id => id !== courseId) : [...current, courseId]
    );
  }

  async function handleContinue() {
    if (continuing) return;

    saveSelectedCourseIds(selectedIds);
    setContinuing(true);

    if (tutorialMode && selectedIds.length === 0) {
      saveTutorialState(createTutorialState());
      setContinuing(false);
      return;
    }

    if (tutorialMode && selectedIds.length > 0) {
      try {
        const supabase = createClient();
        const targets = await buildTutorialTargets(supabase, selectedIds);
        saveTutorialState({ ...createTutorialState(targets ?? undefined), stepIndex: 1 });

        if (targets?.chapterNotesHref) {
          router.push(targets.chapterNotesHref);
          return;
        }
      } catch {
        saveTutorialState(createTutorialState());
      }
    }

    if (tutorialMode) {
      saveTutorialState(createTutorialState());
    }

    router.push(continueHref);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="app-page py-10">
        {!tutorialMode && (
          <section className="mb-8 grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="app-panel p-6 sm:p-8">
              <p className="app-kicker">Build your setup</p>
              <h1 className="app-title mt-3">Choose the AP classes you actually need.</h1>
              <p className="app-copy mt-4 max-w-3xl">
                EverythingAP works best when the dashboard, course flow, and practice tools are built around your real schedule instead of every course at once.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="app-primary-button inline-flex items-center gap-2 px-5 py-3 text-sm"
                >
                  {continuing ? "Opening your dashboard..." : "Save classes and continue"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                {allowGuest && (
                  <GuestModeButton
                    label="Continue as guest"
                    className="app-secondary-button px-5 py-3 text-sm font-semibold"
                  />
                )}
              </div>
            </div>

            <div className="app-panel p-6">
              <p className="app-kicker">What happens next</p>
              <div className="mt-4 space-y-3">
                {[
                  "Your selected classes stay pinned in the sidebar and at the top of the dashboard.",
                  "Each course opens into notes, chapter quizzes, flashcards, key concepts, unit exams, and full AP mocks.",
                  "Your own reminders, confidence, and reflections stay in Student Space instead of cluttering study pages.",
                ].map((item, index) => (
                  <div key={item} className="app-card flex items-start gap-3 p-4">
                    <div
                      className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white"
                      style={{ background: "var(--accent)" }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 app-copy">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tutorialMode && (
          <section className="mb-8 app-panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                  <Sparkles className="h-3.5 w-3.5" />
                  Tutorial setup
                </div>
                <h1 className="app-title mt-4">Pick one class to start the walkthrough.</h1>
                <p className="app-copy mt-3 max-w-3xl">
                  That&apos;s it. Once you save a class, the tutorial popup will walk you through the actual notes, chapter quiz, flashcards, key concepts, unit exam, reflections, and full AP mock pages inside the real app.
                </p>
              </div>

              <button
                type="button"
                onClick={handleContinue}
                className="app-primary-button inline-flex items-center gap-2 px-5 py-3 text-sm"
              >
                {continuing ? "Opening tutorial..." : "Start tutorial"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        )}

        <section className="app-panel p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="app-kicker">{tutorialMode ? "Pick your classes" : "Choose your AP classes"}</p>
              <h2 className="app-section-title mt-2">
                {tutorialMode ? "Select the classes you want the tutorial to use." : "Select everything you're taking this year."}
              </h2>
            </div>
            <div className="app-chip px-3 py-1.5 text-sm font-semibold">
              {selectedIds.length} selected
            </div>
          </div>

          {loading ? (
            <p className="text-sm app-copy">Loading courses...</p>
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
                          className="app-card border p-4 text-left transition-transform hover:-translate-y-0.5"
                          style={{
                            borderColor: active ? "var(--accent)" : "var(--line)",
                            background: active ? "var(--accent-soft)" : "var(--surface)",
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl"
                              style={{ background: `${course.color}20` }}
                            >
                              <span aria-hidden="true">{course.emoji}</span>
                            </div>
                            {active && (
                              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ background: "var(--surface)", color: "var(--accent)" }}>
                                <Check className="h-3.5 w-3.5" />
                                Selected
                              </span>
                            )}
                          </div>
                          <h4 className="mt-4 font-display text-lg font-semibold">{course.name}</h4>
                          <p className="mt-2 text-sm leading-6 app-copy">
                            Notes, flashcards, chapter quizzes, key concepts, unit exams, and mock AP prep.
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row" style={{ borderColor: "var(--line)" }}>
            <button
              type="button"
              onClick={handleContinue}
              className="app-primary-button inline-flex items-center justify-center gap-2 px-5 py-3 text-sm"
            >
              {tutorialMode ? "Save classes and start tutorial" : "Continue with selected classes"}
              <ArrowRight className="h-4 w-4" />
            </button>
            {!tutorialMode && (
              <Link href="/" className="app-secondary-button px-5 py-3 text-center text-sm font-semibold">
                Back home
              </Link>
            )}
            {tutorialMode && (
              <Link href="/dashboard" className="app-secondary-button px-5 py-3 text-center text-sm font-semibold">
                Skip to dashboard
              </Link>
            )}
          </div>
        </section>

        {!tutorialMode && (
          <section className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: GraduationCap,
                title: "Cleaner dashboard",
                description: "Pinned classes and a real continue-studying path instead of a generic landing page.",
              },
              {
                icon: Sparkles,
                title: "Real setup tutorial",
                description: "The walkthrough follows the actual app pages instead of sending people to a fake info screen.",
              },
              {
                icon: Check,
                title: "Student-controlled study flow",
                description: "Reflections and private study notes live in Student Space so the study pages stay cleaner.",
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="app-panel p-5">
                  <Icon className="h-5 w-5 theme-accent" />
                  <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 app-copy">{item.description}</p>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
