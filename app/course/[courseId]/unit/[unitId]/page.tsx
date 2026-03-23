import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";
import UnitOrganizerClient from "@/components/UnitOrganizerClient";
import { UnitWorkspacePanel } from "@/components/student/StudyWorkspacePanels";

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

          <div className="space-y-6">
            <UnitWorkspacePanel
              unitId={String(unit.id)}
              meta={{
                courseId: course.id,
                unitId: String(unit.id),
                href: `${courseHref}/unit/${unit.id}`,
                label: `${course.name} · ${unit.name}`,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
