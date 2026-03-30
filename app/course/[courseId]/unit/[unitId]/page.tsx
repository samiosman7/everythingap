import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, NotebookPen } from "lucide-react";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";
import UnitOrganizerClient from "@/components/UnitOrganizerClient";

export default async function UnitPage({ params }: { params: Promise<{ courseId: string; unitId: string }> }) {
  const { courseId, unitId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, emoji, color"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, name, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, unit_id, chapter_number, name, quiz")
    .eq("unit_id", unitId)
    .order("chapter_number");

  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href="/dashboard" className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          All courses
        </Link>
        <span style={{ color: "var(--line-strong)" }}>/</span>
        <Link href={courseHref} className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          {course.name}
        </Link>
        <span style={{ color: "var(--line-strong)" }}>/</span>
        <span className="text-sm font-medium">{unit.name}</span>
      </nav>

      <main className="app-page">
        <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
          <UnitOrganizerClient
            courseId={course.id}
            courseHref={courseHref}
            courseColor={course.color ?? "var(--accent)"}
            unitId={String(unit.id)}
            unitName={unit.name}
            unitNumber={unit.unit_number}
            chapters={(chapters ?? []).map(chapter => ({
              id: String(chapter.id),
              chapter_number: chapter.chapter_number,
              name: chapter.name,
              hasQuiz: Array.isArray(chapter.quiz) && chapter.quiz.length > 0,
            }))}
          />

          <section className="app-panel p-6">
            <p className="app-kicker">Unit notebook</p>
            <h2 className="app-section-title mt-3">Keep reflection nearby, not in the way.</h2>
            <p className="app-copy mt-3">
              This page should stay focused on chapters and tools. Your private notes, confidence, and review reminders live one click away in Student Space.
            </p>
            <div className="mt-5 space-y-3">
              {[
                "Use notes for the actual content.",
                "Use chapter quizzes to check what stuck.",
                "Use unit reflection after a full pass, not before.",
              ].map(item => (
                <div key={item} className="app-card px-4 py-3 text-sm app-copy">
                  {item}
                </div>
              ))}
            </div>
            <Link
              href={`/student-space?focus=unit&courseId=${encodeURIComponent(course.id)}&unitId=${encodeURIComponent(
                String(unit.id)
              )}&courseName=${encodeURIComponent(course.name)}&unitName=${encodeURIComponent(unit.name)}&href=${encodeURIComponent(
                `${courseHref}/unit/${unit.id}`
              )}`}
              className="app-primary-button mt-5 inline-flex items-center gap-2 px-4 py-3 text-sm"
            >
              <NotebookPen className="h-4 w-4" />
              Open unit reflection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
