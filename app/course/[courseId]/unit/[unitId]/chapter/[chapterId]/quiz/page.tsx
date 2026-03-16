import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function ChapterQuizPage({
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
    .select("id, name, quiz, unit_id")
    .eq("id", chapterId)
    .single();

  if (!chapter || chapter.unit_id !== parseInt(unitId, 10) || !chapter.quiz) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href={`${getCourseHref(course)}/unit/${unitId}/chapter/${chapterId}`} className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          Back to Notes
        </Link>
      </nav>
      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">
            Chapter Quiz
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{chapter.name}</h1>
          <p className="text-[#8888aa] font-body text-sm mt-1">{chapter.quiz.length} questions</p>
        </div>
        <QuizPlayer questions={chapter.quiz} color={course.color ?? "#6c63ff"} />
      </main>
    </div>
  );
}
