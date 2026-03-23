import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import StudySessionTracker from "@/components/StudySessionTracker";
import StudyQuizExperience from "@/components/student/StudyQuizExperience";
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
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex items-center gap-2 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href={`${courseHref}/unit/${unitId}/chapter/${chapterId}`} className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Back to notes
        </Link>
      </nav>
      <main className="app-page">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          chapterId={String(chapter.id)}
          href={`${courseHref}/unit/${unitId}/chapter/${chapter.id}/quiz`}
          label={`${course.name} · ${chapter.name} quiz`}
          kind="chapter-quiz"
        />

        <div className="app-panel mb-8 p-6 md:p-8">
          <div className="mb-2 app-kicker">Chapter quiz</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{chapter.name}</h1>
          <p className="mt-2 text-sm app-copy">{quizQuestions.length} questions</p>
        </div>

        <StudyQuizExperience
          questions={quizQuestions}
          color={course.color ?? "var(--accent)"}
          courseId={course.id}
          unitId={String(unit.id)}
          chapterId={String(chapter.id)}
          href={`${courseHref}/unit/${unit.id}/chapter/${chapter.id}/quiz`}
          label={`${course.name} · ${chapter.name} quiz`}
          courseName={course.name}
          unitName={unit.name}
          chapterName={chapter.name}
          kind="chapter-quiz"
        />
      </main>
    </div>
  );
}
