import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import StudySessionTracker from "@/components/StudySessionTracker";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function ChapterQuizPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string; chapterId: string }>;
}) {
  const { courseId, unitId, chapterId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

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

  const quizQuestions = Array.isArray(chapter?.quiz) ? chapter.quiz : [];

  if (!chapter || chapter.unit_id !== parseInt(unitId, 10)) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link
          href={`${courseHref}/unit/${unitId}/chapter/${chapterId}`}
          className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
        >
          Back to notes
        </Link>
      </nav>
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          chapterId={String(chapter.id)}
          href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`}
          label={`${course.name} · ${chapter.name} quiz`}
          kind="chapter-quiz"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">Chapter Quiz</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{chapter.name}</h1>
          <p className="mt-2 text-sm font-body text-[#8888aa]">{quizQuestions.length} questions</p>
        </div>

        <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
          <QuizPlayer questions={quizQuestions} color={course.color ?? "#6c63ff"} />
        </div>
      </main>
    </div>
  );
}
