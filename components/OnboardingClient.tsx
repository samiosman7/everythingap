"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  Check,
  ClipboardCheck,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
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

const FIRST_SESSION_STEPS = [
  {
    title: "Choose your AP classes",
    desc: "We use your selections to build a dashboard that feels personal instead of overwhelming.",
    icon: Users,
  },
  {
    title: "Save your setup",
    desc: "Keep your class list, continue to sign up, or stay in guest mode if you just want to explore first.",
    icon: Check,
  },
  {
    title: "Open your study flow",
    desc: "Jump into course hubs, chapter notes, flashcards, quizzes, and exam review without guessing where to start.",
    icon: LayoutDashboard,
  },
];

const GET_STARTED_TIPS = [
  "Start with the class that has your next quiz or FRQ due.",
  "Use chapter notes first when a lesson feels fuzzy, then switch to flashcards or quizzes.",
  "Save at least one course before continuing so the dashboard has something useful waiting for you.",
];

const PLATFORM_TOUR = [
  {
    title: "Dashboard that remembers you",
    desc: "Resume where you left off, see progress, and surface the classes and weak spots that matter next.",
    icon: LayoutDashboard,
  },
  {
    title: "Study tools in one flow",
    desc: "Notes, flashcards, key concepts, chapter quizzes, unit exams, and full AP mocks are connected instead of scattered.",
    icon: ClipboardCheck,
  },
  {
    title: "Student-owned learning layer",
    desc: "Mark confidence, save private notes, track what confused you, and build your own review system inside the app.",
    icon: Brain,
  },
  {
    title: "AI FRQ feedback",
    desc: "Draft responses, get rubric-based feedback, save revision notes, and compare how confident you felt to how you actually scored.",
    icon: MessageSquareText,
  },
];

const STUDY_FLOW = [
  {
    step: "01",
    title: "Open your course hub",
    desc: "Start in the class you actually need today. The dashboard pushes you there fast instead of making you hunt through everything.",
  },
  {
    step: "02",
    title: "Move through a unit in order",
    desc: "Unit pages keep notes, flashcards, key concepts, chapter quizzes, and exams in one clear lane so the next step feels obvious.",
  },
  {
    step: "03",
    title: "Make the app more personal over time",
    desc: "Confidence checks, sticky notes, mistake patterns, and reflections turn the app into your study system instead of just a content library.",
  },
];

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
  const hasSelectedCourses = selectedIds.length > 0;
  const completionPercent = hasSelectedCourses ? 66 : 33;

  function toggleCourse(courseId: string) {
    setSelectedIds(current =>
      current.includes(courseId)
        ? current.filter(id => id !== courseId)
        : [...current, courseId]
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
                {continuing ? "Opening your walkthrough..." : "Save selections and continue"}
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

        <section className="grid gap-4 lg:grid-cols-[1.05fr,0.95fr]">
          <div className="rounded-[32px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
            <div className="flex items-center gap-3 text-[#9d96ff]">
              <Sparkles className="h-5 w-5" />
              <p className="text-xs font-body uppercase tracking-[0.22em]">Guided tour</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold">What this app actually gives you</h2>
            <p className="mt-4 max-w-2xl text-sm font-body leading-7 text-[#9f9fba]">
              Before you pick classes, here is the quick version of what you are setting up: a calmer AP workflow,
              stronger review tools, and a place to track your own understanding instead of just reading static content.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {PLATFORM_TOUR.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[24px] border border-[#212132] bg-[#0d0d14] p-5">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6c63ff]/12 text-[#c9c6ff]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-[#f4f3ff]">{item.title}</h3>
                    <p className="mt-3 text-sm font-body leading-6 text-[#9292b0]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#1e1e2e] bg-[linear-gradient(180deg,#131320_0%,#0d0d14_100%)] p-6 md:p-8">
            <div className="flex items-center gap-3 text-[#9d96ff]">
              <Target className="h-5 w-5" />
              <p className="text-xs font-body uppercase tracking-[0.22em]">How students use it</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold">The intended study path</h2>
            <div className="mt-6 space-y-4">
              {STUDY_FLOW.map(item => (
                <div key={item.step} className="rounded-[24px] border border-[#222233] bg-[#0b0b12] p-5">
                  <div className="text-[11px] font-body uppercase tracking-[0.22em] text-[#bdb9ff]">Step {item.step}</div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm font-body leading-7 text-[#a6a6c0]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="rounded-[32px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
            <div className="flex items-center gap-3 text-[#9d96ff]">
              <BookOpenText className="h-5 w-5" />
              <p className="text-xs font-body uppercase tracking-[0.22em]">Guided setup</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold">Here&apos;s exactly how to get started.</h2>
            <p className="mt-4 max-w-2xl text-sm font-body leading-7 text-[#9f9fba]">
              This page is your quick tutorial. Finish the three steps below and the site will feel much easier to use on
              your first real study session.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {FIRST_SESSION_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isComplete = index === 0 ? hasSelectedCourses : false;
                return (
                  <div
                    key={step.title}
                    className={`rounded-[24px] border p-5 ${
                      isComplete ? "border-[#6c63ff]/35 bg-[#161625]" : "border-[#212132] bg-[#0d0d14]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6c63ff]/12 text-[#c9c6ff]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[11px] font-body uppercase tracking-[0.18em] text-[#7e7aa2]">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-[#f4f3ff]">{step.title}</h3>
                    <p className="mt-3 text-sm font-body leading-6 text-[#9292b0]">{step.desc}</p>
                    <p className="mt-4 text-xs font-body uppercase tracking-[0.18em] text-[#bdb9ff]">
                      {isComplete ? "Done" : "Up next"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#1e1e2e] bg-[linear-gradient(180deg,#131320_0%,#0d0d14_100%)] p-6 md:p-8">
            <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Setup progress</p>
            <h2 className="mt-3 font-display text-3xl font-bold">Your first-study checklist</h2>
            <p className="mt-4 text-sm font-body leading-7 text-[#9f9fba]">
              Pick at least one course now, then continue so your dashboard opens with the right material already ready.
            </p>

            <div className="mt-6 rounded-[24px] border border-[#242438] bg-[#0b0b12] p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-body text-[#d9d9ec]">Setup completion</span>
                <span className="text-sm font-body text-[#c7c4ff]">{completionPercent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#1a1a28]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#6c63ff_0%,#9d96ff_100%)] transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <div className="mt-5 space-y-3">
                {GET_STARTED_TIPS.map((tip, index) => (
                  <div key={tip} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#6c63ff]/12 text-[11px] font-semibold text-[#c9c6ff]">
                      {index + 1}
                    </div>
                    <p className="text-sm font-body leading-6 text-[#b8b8d2]">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#1e1e2e] bg-[linear-gradient(180deg,#12121d_0%,#0d0d14_100%)] p-6 md:p-8">
          <div className="flex items-center gap-3 text-[#9d96ff]">
            <BookOpenText className="h-5 w-5" />
            <p className="text-xs font-body uppercase tracking-[0.22em]">What opens after setup</p>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold">Once you choose classes, here is what starts working for you</h2>
          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {[
              {
                title: "Course and unit hubs",
                desc: "A cleaner course -> unit -> chapter structure, with progress bars, resume buttons, and less dead-end clicking.",
              },
              {
                title: "Study support that adapts",
                desc: "Your notes, confidence marks, review-later flags, flashcard reminders, and reflections all sync back to your account.",
              },
              {
                title: "Practice with feedback",
                desc: "Chapter quizzes, unit exams, full AP mocks, and rubric-based FRQ grading all feed into the same study loop.",
              },
            ].map(item => (
              <div key={item.title} className="rounded-[24px] border border-[#222233] bg-[#0b0b12] p-5">
                <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm font-body leading-7 text-[#a6a6c0]">{item.desc}</p>
              </div>
            ))}
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
