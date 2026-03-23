import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FlashcardDeck from "@/components/FlashcardDeck";
import StudySessionTracker from "@/components/StudySessionTracker";
import { FlashcardWorkspacePanel } from "@/components/student/StudyWorkspacePanels";
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
    <div className="min-h-screen">
      <nav
        className="sticky top-0 z-50 flex items-center gap-2 border-b px-6 py-4 backdrop-blur-md"
        style={{ borderColor: "var(--line)", background: "color-mix(in srgb, var(--bg-elevated) 86%, transparent)" }}
      >
        <Link href={`${courseHref}/unit/${unitId}`} className="text-sm transition-colors" style={{ color: "var(--text-muted)" }}>
          Back to {unit.name}
        </Link>
      </nav>
      <main className="app-page">
        <StudySessionTracker
          courseId={course.id}
          unitId={String(unit.id)}
          href={`${courseHref}/unit/${unitId}/flashcards`}
          label={`${course.name} · ${unit.name} flashcards`}
          kind="flashcards"
        />

        <div className="app-panel mb-8 p-6 text-center md:p-8">
          <div className="mb-2 app-kicker">Flashcards</div>
          <h1 className="font-display text-2xl font-bold md:text-4xl">{unit.name}</h1>
          <p className="mt-2 text-sm app-copy">{flashcards?.length ?? 0} cards</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          {flashcards?.length ? (
            <div className="app-panel p-6 md:p-8">
              <FlashcardDeck cards={flashcards} color={course.color ?? "var(--accent)"} />
            </div>
          ) : (
            <div className="app-panel py-16 text-center">
              <div className="mb-3 text-3xl font-display font-bold">Soon</div>
              <p className="app-copy">Flashcards are being generated. Check back soon.</p>
            </div>
          )}

          <div className="space-y-6">
            <FlashcardWorkspacePanel
              unitId={String(unit.id)}
              meta={{
                courseId: course.id,
                unitId: String(unit.id),
                href: `${courseHref}/unit/${unit.id}/flashcards`,
                label: `${course.name} · ${unit.name} flashcards`,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
