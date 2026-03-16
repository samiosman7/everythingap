import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import NotesRenderer from "@/components/NotesRenderer";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string; chapterId: string }>;
}) {
  const { courseId, unitId, chapterId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/auth/login");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, color"
  );
  if (!course) notFound();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("id, chapter_number, name, notes, quiz, unit_id")
    .eq("id", chapterId)
    .single();

  if (!chapter || chapter.unit_id !== parseInt(unitId, 10)) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, unit_number, name, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const { data: siblings } = await supabase
    .from("chapters")
    .select("id, chapter_number, name")
    .eq("unit_id", unitId)
    .order("chapter_number");

  const currentIdx = siblings?.findIndex(c => c.id === chapter.id) ?? -1;
  const prev = currentIdx > 0 ? siblings![currentIdx - 1] : null;
  const next = currentIdx < (siblings?.length ?? 0) - 1 ? siblings![currentIdx + 1] : null;
  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md flex-wrap">
        <Link href={courseHref} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">{course.name}</Link>
        <span className="text-[#2a2a3a]">/</span>
        <Link href={`${courseHref}/unit/${unitId}`} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">{unit.name}</Link>
        <span className="text-[#2a2a3a]">/</span>
        <span className="text-[#e8e8f0] text-sm font-body font-medium truncate max-w-[200px]">{chapter.name}</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">
              Unit {unit.unit_number} · Chapter {chapter.chapter_number}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold">{chapter.name}</h1>
          </div>
          {chapter.quiz && (
            <Link
              href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`}
              className="flex-shrink-0 px-4 py-2 rounded-xl bg-[#6c63ff]/10 border border-[#6c63ff]/30 hover:bg-[#6c63ff]/20 text-[#9d96ff] text-sm font-body font-medium transition-all"
            >
              Take Quiz
            </Link>
          )}
        </div>

        {chapter.notes ? (
          <NotesRenderer notes={chapter.notes} />
        ) : (
          <div className="text-center py-16 text-[#8888aa] font-body">
            <div className="text-3xl mb-3">Soon</div>
            <p>Notes are being generated. Check back soon.</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#1e1e2e] gap-4">
          {prev ? (
            <Link href={`${courseHref}/unit/${unitId}/chapter/${prev.id}`} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] text-sm font-body transition-all group max-w-[45%]">
              <span className="text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors">Prev</span>
              <span className="text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors truncate">{prev.name}</span>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`${courseHref}/unit/${unitId}/chapter/${next.id}`} className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] text-sm font-body transition-all group max-w-[45%] ml-auto">
              <span className="text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors truncate">{next.name}</span>
              <span className="text-[#8888aa] group-hover:text-[#e8e8f0] transition-colors">Next</span>
            </Link>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
