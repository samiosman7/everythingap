import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import FlashcardDeck from "@/components/FlashcardDeck";

export default async function FlashcardsPage({
  params,
}: {
  params: { courseId: string; unitId: string };
}) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: unit } = await supabase
    .from("units")
    .select("id, name, unit_number, course_id")
    .eq("id", params.unitId)
    .single();

  if (!unit || unit.course_id !== params.courseId) notFound();

  const { data: flashcards } = await supabase
    .from("flashcards")
    .select("id, question, answer")
    .eq("unit_id", params.unitId);

  const { data: course } = await supabase
    .from("courses")
    .select("id, name, color")
    .eq("id", params.courseId)
    .single();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href={`/course/${params.courseId}/unit/${params.unitId}`}
          className="text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
          ← {unit.name}
        </Link>
      </nav>
      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <div className="text-[#8888aa] text-xs font-body font-medium uppercase tracking-widest mb-2">Flashcards</div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">{unit.name}</h1>
          <p className="text-[#8888aa] font-body text-sm mt-1">{flashcards?.length ?? 0} cards</p>
        </div>
        {flashcards?.length ? (
          <FlashcardDeck cards={flashcards} color={course?.color ?? "#6c63ff"} />
        ) : (
          <div className="text-center py-16 text-[#8888aa] font-body">
            <div className="text-3xl mb-3">⏳</div>
            <p>Flashcards are being generated. Check back soon.</p>
          </div>
        )}
      </main>
    </div>
  );
}
