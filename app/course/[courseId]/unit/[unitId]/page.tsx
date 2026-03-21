import { redirect, notFound } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex flex-wrap items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link href="/dashboard" className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
          All courses
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <Link href={courseHref} className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]">
          {course.name}
        </Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-sm font-body font-medium text-[#e8e8f0]">{unit.name}</span>
      </nav>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <UnitOrganizerClient
          courseId={course.id}
          courseHref={courseHref}
          courseColor={course.color ?? "#6c63ff"}
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
      </main>
    </div>
  );
}
