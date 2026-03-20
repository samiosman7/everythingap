import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FlashcardDeck from "@/components/FlashcardDeck";
import StudySessionTracker from "@/components/StudySessionTracker";
import { getViewerContext } from "@/lib/viewer";
import { getCourseByIdentifier, getCourseHref } from "@/lib/course";

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ courseId: string; unitId: string }>;
}) {
  const { courseId, unitId } = await params;
  const { supabase, user, isGuest } = await getViewerContext();
  if (!user && !isGuest) redirect("/sign-in");

  const { data: course } = await getCourseByIdentifier(
    supabase,
    courseId,
    "id, slug, name, color"
  );
  if (!course) notFound();

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id")
    .eq("id", unitId)
    .single();

  if (!unit || unit.course_id !== course.id) notFound();

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id, unit_id, question, answer")
    .eq("unit_id", unitId);

  const courseHref = getCourseHref(course);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link
          href={`${courseHref}/unit/${unitId}`}
          className="text-sm font-body text-[#8888aa] transition-colors hover:text-[#e8e8f0]"
        >
          Back to {unit.name}
        </Link>
      </nav>
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          href={`${courseHref}/unit/${unitId}/flashcards`}
          label={`${course.name} · ${unit.name} flashcards`}
          kind="flashcards"
        />

        <div className="mb-8 rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 text-center md:p-8">
          <div className="mb-2 text-xs font-body font-medium uppercase tracking-widest text-[#8888aa]">Flashcards</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          <p className="mt-2 text-sm font-body text-[#8888aa]">{flashcards?.length ?? 0} cards</p>
        </div>

        {flashcards?.length ? (
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] p-6 md:p-8">
            <FlashcardDeck cards={flashcards} color={course.color ?? "#6c63ff"} />
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#1e1e2e] bg-[#111118] py-16 text-center font-body text-[#8888aa]">
            <div className="mb-3 text-3xl">Soon</div>
            <p>Flashcards are being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
