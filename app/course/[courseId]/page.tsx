import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { BookOpenText, Brain, FileSpreadsheet, Sparkles } from "lucide-react";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";
import { getCourseBadge } from "@/lib/course-display";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, emoji, color, accent, full_exam"
  );

  if (!course) notFound();

  const { data: units } = await supabase
    .from("units")
    .select("id, unit_number, name")
    .eq("course_id", course.id)
    .order("unit_number");

  const courseHref = getCourseHref(course);
  const tools = [
    { title: "Teacher notes", icon: BookOpenText, desc: "Break down every chapter with explanations, examples, and exam tips." },
    { title: "Flashcards + concepts", icon: Brain, desc: "Quick memory work for formulas, terms, and high-yield ideas." },
    { title: "Quizzes + exams", icon: FileSpreadsheet, desc: "Practice at the chapter, unit, and full AP exam level." },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-3 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href="/dashboard" className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          Back to dashboard
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-[#e8e8f0] text-sm font-body font-medium">{course.name}</span>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <section className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-7">
            <div className="flex items-start gap-5">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-mono font-bold"
                style={{ background: `${course.color}22`, color: course.color }}
              >
                {getCourseBadge(course.name)}
              </div>
              <div>
                <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Course hub</p>
                <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold">{course.name}</h1>
                <p className="mt-3 text-sm font-body leading-7 text-[#8f8fac]">
                  Everything for this AP class lives here. Start with a unit and jump straight into notes,
                  flashcards, key concepts, quizzes, and AP-style exam prep.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {tools.map(tool => {
                const Icon = tool.icon;
                return (
                  <div key={tool.title} className="rounded-2xl border border-[#1e1e2e] bg-[#0c0c12] p-4">
                    <Icon className="h-5 w-5 text-[#9d96ff]" />
                    <h2 className="mt-3 font-display text-lg font-semibold">{tool.title}</h2>
                    <p className="mt-2 text-sm font-body leading-6 text-[#8a8aa5]">{tool.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-7">
            <div className="flex items-center gap-2 text-[#9d96ff]">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-body uppercase tracking-[0.22em]">Quick access</p>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold">What this course includes</h2>
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#0c0c12] p-4 text-sm font-body text-[#d5d5ea]">
                Every unit has a dedicated hub.
              </div>
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#0c0c12] p-4 text-sm font-body text-[#d5d5ea]">
                Each hub makes notes, flashcards, key concepts, and exams obvious.
              </div>
              <div className="rounded-2xl border border-[#1e1e2e] bg-[#0c0c12] p-4 text-sm font-body text-[#d5d5ea]">
                Full AP mock exam appears here when the course includes one.
              </div>
            </div>

            {course.full_exam && (
              <Link
                href={`${courseHref}/exam`}
                className="mt-5 block rounded-2xl border px-5 py-4 text-sm font-body transition-all hover:-translate-y-0.5"
                style={{ background: `${course.color}10`, borderColor: `${course.color}30`, color: "#f0f0ff" }}
              >
                Open full AP mock exam
              </Link>
            )}
          </div>
        </section>

        <section className="mt-10 space-y-4">
          <div>
            <p className="text-xs font-body uppercase tracking-[0.22em] text-[#9d96ff]">Units</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Choose a unit to start studying</h2>
          </div>

          {units?.map(unit => (
            <div key={unit.id} className="rounded-[24px] border border-[#1e1e2e] bg-[#111118] overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#1e1e2e] px-6 py-4">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-mono font-bold"
                  style={{ background: `${course.color}22`, color: course.color }}
                >
                  {unit.unit_number}
                </span>
                <h3 className="font-display text-lg font-semibold">{unit.name}</h3>
              </div>
              <div className="flex flex-wrap gap-3 px-6 py-5">
                <Link href={`${courseHref}/unit/${unit.id}`} className="rounded-xl bg-[#1e1e2e] px-4 py-2 text-sm font-body font-medium text-[#f3f3fb] transition-colors hover:bg-[#29293d]">
                  Open unit hub
                </Link>
                <Link href={`${courseHref}/unit/${unit.id}/flashcards`} className="rounded-xl border border-[#26263a] px-4 py-2 text-sm font-body font-medium text-[#d5d5ea] transition-colors hover:border-[#6c63ff]/30">
                  Flashcards
                </Link>
                <Link href={`${courseHref}/unit/${unit.id}/key-concepts`} className="rounded-xl border border-[#26263a] px-4 py-2 text-sm font-body font-medium text-[#d5d5ea] transition-colors hover:border-[#6c63ff]/30">
                  Key concepts
                </Link>
                <Link href={`${courseHref}/unit/${unit.id}/quiz`} className="rounded-xl border border-[#26263a] px-4 py-2 text-sm font-body font-medium text-[#d5d5ea] transition-colors hover:border-[#6c63ff]/30">
                  Unit exam
                </Link>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
