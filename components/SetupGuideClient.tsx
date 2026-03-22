"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  ClipboardCheck,
  Compass,
  GraduationCap,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { readSelectedCourseIds } from "@/lib/course-preferences";
import { getCourseHref } from "@/lib/course";

type GuideCourse = {
  id: string;
  slug?: string | null;
  name: string;
  emoji: string;
  full_exam?: unknown;
};

type GuideUnit = {
  id: number;
  course_id: string;
  unit_number: number;
  name: string;
  unit_exam?: unknown;
  key_concepts?: unknown;
};

type GuideChapter = {
  id: number;
  unit_id: number;
  chapter_number: number;
  name: string;
  quiz?: unknown;
};

type GuideData = {
  course: GuideCourse | null;
  unit: GuideUnit | null;
  chapter: GuideChapter | null;
  hasChapterQuiz: boolean;
  hasUnitExam: boolean;
  hasKeyConcepts: boolean;
  hasFullExam: boolean;
};

const FEATURES = [
  {
    title: "Organized study flow",
    desc: "The app is meant to take you from course hub, to unit hub, to chapter notes, to practice without making you guess what comes next.",
    icon: Compass,
  },
  {
    title: "Practice that actually loops back",
    desc: "Quizzes, unit exams, and full AP mocks are meant to lead you back into review instead of acting like dead-end score pages.",
    icon: ClipboardCheck,
  },
  {
    title: "Your own learning layer",
    desc: "Confidence checks, private notes, review-later flags, and reflections make the app more personal the more you use it.",
    icon: Brain,
  },
  {
    title: "AI rubric feedback",
    desc: "FRQ practice includes rubric-based AI feedback so you can revise with something more useful than just 'good job' or 'wrong.'",
    icon: MessageSquareText,
  },
];

function StepCard({
  step,
  title,
  desc,
  href,
  hrefLabel,
  disabled = false,
}: {
  step: string;
  title: string;
  desc: string;
  href: string;
  hrefLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-[26px] border border-[#1e1e2e] bg-[#111118] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex rounded-full border border-[#6c63ff]/25 bg-[#6c63ff]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8c4ff]">
          Step {step}
        </div>
        {disabled ? (
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-[#6f6b86]">
            Not ready yet
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#a3a0b8]">{desc}</p>
      <Link
        href={href}
        className={`mt-5 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
          disabled
            ? "pointer-events-none border border-white/10 bg-white/[0.03] text-[#6f6b86]"
            : "bg-[#8b80ff] text-white hover:bg-[#9a90ff]"
        }`}
      >
        {hrefLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function SetupGuideClient() {
  const [loading, setLoading] = useState(true);
  const [guideData, setGuideData] = useState<GuideData>({
    course: null,
    unit: null,
    chapter: null,
    hasChapterQuiz: false,
    hasUnitExam: false,
    hasKeyConcepts: false,
    hasFullExam: false,
  });

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const selectedIds = readSelectedCourseIds();

      if (!selectedIds.length) {
        if (mounted) setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data: courses } = await supabase
        .from("courses")
        .select("id, slug, name, emoji, full_exam")
        .in("id", selectedIds)
        .order("name");

      const firstCourse = (courses ?? []).find(course => selectedIds.includes(course.id)) ?? (courses ?? [])[0] ?? null;

      if (!firstCourse) {
        if (mounted) setLoading(false);
        return;
      }

      const { data: units } = await supabase
        .from("units")
        .select("id, course_id, unit_number, name, unit_exam, key_concepts")
        .eq("course_id", firstCourse.id)
        .order("unit_number");

      const firstUnit = (units ?? [])[0] ?? null;

      let firstChapter: GuideChapter | null = null;
      if (firstUnit) {
        const { data: chapters } = await supabase
          .from("chapters")
          .select("id, unit_id, chapter_number, name, quiz")
          .eq("unit_id", firstUnit.id)
          .order("chapter_number");
        firstChapter = (chapters ?? [])[0] ?? null;
      }

      if (!mounted) return;

      setGuideData({
        course: firstCourse,
        unit: firstUnit,
        chapter: firstChapter,
        hasChapterQuiz: Array.isArray(firstChapter?.quiz) && firstChapter.quiz.length > 0,
        hasUnitExam: Boolean(firstUnit?.unit_exam),
        hasKeyConcepts: Array.isArray(firstUnit?.key_concepts) && firstUnit.key_concepts.length > 0,
        hasFullExam: Boolean(firstCourse.full_exam),
      });
      setLoading(false);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const courseHref = guideData.course ? getCourseHref(guideData.course) : "/dashboard";
  const unitHref = guideData.unit ? `${courseHref}/unit/${guideData.unit.id}` : courseHref;
  const chapterHref = guideData.chapter ? `${unitHref}/chapter/${guideData.chapter.id}` : unitHref;

  const guideSteps = useMemo(
    () => [
      {
        step: "01",
        title: "Pick your AP classes",
        desc: "Start by choosing the classes you actually take so the dashboard, sidebar, and first study links feel personal instead of random.",
        href: "/onboarding",
        hrefLabel: "Choose classes",
        disabled: false,
      },
      {
        step: "02",
        title: "Open your dashboard",
        desc: "This is your command center. It is where progress, resume links, pinned classes, and your learning insights start to make sense.",
        href: "/dashboard",
        hrefLabel: "Open dashboard",
        disabled: false,
      },
      {
        step: "03",
        title: `Open ${guideData.course?.name ?? "a course"}'s course hub`,
        desc: "Course hubs are the top-level home for a class. They show units, overall progress, and the link to a full mock exam when available.",
        href: courseHref,
        hrefLabel: "Open course hub",
        disabled: !guideData.course,
      },
      {
        step: "04",
        title: `Open ${guideData.unit?.name ?? "a unit"}'s unit hub`,
        desc: "Unit hubs collect chapter notes, flashcards, key concepts, quizzes, and the unit exam in one place so the flow is obvious.",
        href: unitHref,
        hrefLabel: "Open unit hub",
        disabled: !guideData.unit,
      },
      {
        step: "05",
        title: "Read the chapter notes",
        desc: "Chapter pages are where the detailed notes live, along with your own private notes, confidence tracking, reminders, and reflections.",
        href: chapterHref,
        hrefLabel: "Open chapter notes",
        disabled: !guideData.chapter,
      },
      {
        step: "06",
        title: "Try the chapter quiz",
        desc: "After notes, the chapter quiz is the fastest way to check whether the chapter actually stuck and save what you missed.",
        href: `${chapterHref}/quiz`,
        hrefLabel: "Open chapter quiz",
        disabled: !guideData.chapter || !guideData.hasChapterQuiz,
      },
      {
        step: "07",
        title: "Use the review tools",
        desc: "Flashcards and key concepts help you move from reading into recall. They are best when a lesson is familiar but not fully locked in yet.",
        href: `${unitHref}/flashcards`,
        hrefLabel: "Open flashcards",
        disabled: !guideData.unit,
      },
      {
        step: "08",
        title: "Review key concepts",
        desc: "Key concepts pages give you the must-know terms, formulas, events, and ideas from the unit in one skimmable reference view.",
        href: `${unitHref}/key-concepts`,
        hrefLabel: "Open key concepts",
        disabled: !guideData.unit || !guideData.hasKeyConcepts,
      },
      {
        step: "09",
        title: "Take the unit exam",
        desc: "Unit exams pull the whole unit together with multiple choice and FRQs, plus the student notes and reflection layer you added.",
        href: `${unitHref}/quiz`,
        hrefLabel: "Open unit exam",
        disabled: !guideData.unit || !guideData.hasUnitExam,
      },
      {
        step: "10",
        title: "Try the full AP mock exam",
        desc: "Full mock exams are where the whole system comes together: pacing, practice, progress tracking, and AI FRQ feedback.",
        href: `${courseHref}/exam`,
        hrefLabel: "Open full mock exam",
        disabled: !guideData.course || !guideData.hasFullExam,
      },
    ],
    [chapterHref, courseHref, guideData.chapter, guideData.course, guideData.hasChapterQuiz, guideData.hasFullExam, guideData.hasKeyConcepts, guideData.hasUnitExam, guideData.unit, unitHref]
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-8 text-[#e8e8f0]">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-4 rounded-[32px] border border-[#1e1e2e] bg-[radial-gradient(circle_at_top_left,_rgba(108,99,255,0.24),_transparent_42%),linear-gradient(180deg,#111118_0%,#0c0c13_100%)] p-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#b7b2ff]">
              <Sparkles className="h-4 w-4" />
              Guided setup
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-tight md:text-5xl">
              This is the actual walkthrough of the app, page by page.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#b1b1cb]">
              Instead of just telling you what EverythingAP offers, this guide shows you the exact order a new student
              should click through it: classes, dashboard, course hub, unit hub, chapter notes, quizzes, review tools,
              and full exam practice.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={guideData.course ? courseHref : "/onboarding"}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#8b80ff] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#9a90ff]"
              >
                {guideData.course ? "Start with my first class" : "Choose my classes first"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium text-[#ece9fb] transition-colors hover:border-[#8b80ff]/40 hover:bg-white/10"
              >
                Go to dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#222233] bg-[#0d0d14]/90 p-6">
            <div className="flex items-center gap-2 text-[#9d96ff]">
              <GraduationCap className="h-4 w-4" />
              <p className="text-xs uppercase tracking-[0.2em]">What this walkthough covers</p>
            </div>
            <div className="mt-5 space-y-4">
              {FEATURES.map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-[#1e1e2e] bg-[#111118] p-4">
                    <div className="mt-0.5 rounded-full bg-[#6c63ff]/12 p-2 text-[#b7b2ff]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#f3f3fb]">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-[#8a8aa5]">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#9d96ff]">Tour sequence</p>
              <h2 className="mt-2 font-display text-3xl font-bold">Click through the app in the right order</h2>
            </div>
            {loading ? (
              <span className="text-sm text-[#8c8cab]">Loading your first class...</span>
            ) : guideData.course ? (
              <span className="rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/12 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#c9c6ff]">
                Starting with {guideData.course.name}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[#8c8cab]">
                No classes selected yet
              </span>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {guideSteps.map(step => (
              <StepCard key={step.step} {...step} />
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr]">
          <div className="rounded-[32px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
            <div className="flex items-center gap-3 text-[#9d96ff]">
              <Target className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.22em]">How the system is supposed to feel</p>
            </div>
            <div className="mt-5 space-y-4">
              {[
                "Dashboard first when you need orientation.",
                "Course hub when you need the big picture for one class.",
                "Unit hub when you know the unit but not the next move.",
                "Chapter notes when the lesson itself still feels fuzzy.",
                "Chapter quiz when you want a fast check on whether it stuck.",
                "Flashcards and key concepts when recall is the weak point.",
                "Unit and full exams when you need real AP-style pressure.",
              ].map(item => (
                <div key={item} className="rounded-2xl border border-[#212132] bg-[#0d0d14] px-4 py-4 text-sm leading-7 text-[#a3a0b8]">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-[#1e1e2e] bg-[linear-gradient(180deg,#131320_0%,#0d0d14_100%)] p-6 md:p-8">
            <div className="flex items-center gap-3 text-[#9d96ff]">
              <BookOpenText className="h-5 w-5" />
              <p className="text-xs uppercase tracking-[0.22em]">Why this matters</p>
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold">The point is not just to show features.</h2>
            <p className="mt-4 text-sm leading-7 text-[#9f9fba]">
              The point is to make a new student understand the app’s logic quickly enough that the product starts
              feeling calm instead of confusing. This page is meant to teach the route through the app, not just describe it.
            </p>
            <div className="mt-6 rounded-[24px] border border-[#222233] bg-[#0b0b12] p-5">
              <p className="text-sm font-semibold text-white">Best first run</p>
              <p className="mt-3 text-sm leading-7 text-[#a6a6c0]">
                Pick classes, open your dashboard, open a course hub, enter a unit, read one chapter, take its quiz,
                then come back and use flashcards or key concepts on the topic that still feels weakest.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
