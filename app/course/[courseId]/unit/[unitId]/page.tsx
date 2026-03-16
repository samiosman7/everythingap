import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Chapter } from "@/types";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function UnitPage({ params }: { params: { courseId: string; unitId: string } }) {
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    params.courseId,
    "id, slug, name, emoji, color"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, name, course_id")
    .eq("id", params.unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const { data: chapters } = await supabase
    .from("chapters")
    .select("id, unit_id, chapter_number, name, quiz")
    .eq("unit_id", params.unitId)
    .order("chapter_number");

  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md flex-wrap">
        <Link href="/dashboard" className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">All Courses</Link>
        <span className="text-[#2a2a3a]">/</span>
        <Link href={courseHref} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">{course.name}</Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-[#e8e8f0] text-sm font-body font-medium">{unit.name}</span>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">Unit {unit.unit_number}</div>
          <h1 className="font-display text-3xl font-bold mb-4">{unit.name}</h1>

          <div className="flex flex-wrap gap-2">
            <Link href={`${courseHref}/unit/${params.unitId}/flashcards`} className="px-4 py-2 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#6c63ff]/40 text-sm font-body text-[#e8e8f0] transition-all flex items-center gap-2">
              Flashcards
            </Link>
            <Link href={`${courseHref}/unit/${params.unitId}/key-concepts`} className="px-4 py-2 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#6c63ff]/40 text-sm font-body text-[#e8e8f0] transition-all flex items-center gap-2">
              Key Concepts
            </Link>
            <Link href={`${courseHref}/unit/${params.unitId}/quiz`} className="px-4 py-2 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#6c63ff]/40 text-sm font-body text-[#e8e8f0] transition-all flex items-center gap-2">
              Unit Exam
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-semibold text-sm text-[#8888aa] uppercase tracking-widest mb-4">Chapters</h2>
          {chapters?.map((chapter: Chapter) => (
            <div key={chapter.id} className="flex items-center gap-3 p-4 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] transition-all group">
              <span className="w-7 h-7 rounded-lg bg-[#1e1e2e] flex items-center justify-center text-xs font-mono text-[#8888aa] flex-shrink-0">
                {chapter.chapter_number}
              </span>
              <span className="flex-1 font-body text-sm text-[#e8e8f0] font-medium">{chapter.name}</span>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`${courseHref}/unit/${params.unitId}/chapter/${chapter.id}`} className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-xs font-body text-[#e8e8f0] transition-colors">
                  Notes
                </Link>
                {chapter.quiz && (
                  <Link href={`${courseHref}/unit/${params.unitId}/chapter/${chapter.id}/quiz`} className="px-3 py-1.5 rounded-lg bg-[#1e1e2e] hover:bg-[#2a2a3a] text-xs font-body text-[#e8e8f0] transition-colors">
                    Quiz
                  </Link>
                )}
              </div>
              <Link href={`${courseHref}/unit/${params.unitId}/chapter/${chapter.id}`} className="text-[#2a2a3a] group-hover:text-[#8888aa] transition-colors">
                Go
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
