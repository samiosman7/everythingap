import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Course } from "@/types";
import LogoutButton from "@/components/LogoutButton";
import { getViewerContext } from "@/lib/viewer";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");

  const [clerkUser, { data: courses }] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji, color, accent").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur-md">
        <Link href="/" className="font-display font-bold text-lg tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-[#8888aa] text-sm font-body hidden sm:block">
            {isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          </span>
          <LogoutButton isGuest={isGuest} />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {isGuest && (
          <div className="mb-8 rounded-2xl border border-[#6c63ff]/20 bg-[#6c63ff]/8 p-4">
            <p className="font-body text-sm text-[#d9d7ff]">
              You&apos;re browsing in guest mode. Content is fully available, but progress is not saved.
            </p>
          </div>
        )}

        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Your AP dashboard</h1>
          <p className="text-[#8888aa] font-body">
            Notes, flashcards, key concepts, quizzes, unit exams, and full AP mock exams in one place.
          </p>
        </div>

        <DashboardClient courses={(courses as Course[]) ?? []} />

        {!courses?.length && (
          <div className="text-center py-20 text-[#8888aa] font-body">
            <div className="text-4xl mb-4">AP</div>
            <p>No courses found yet. Populate the database and they&apos;ll appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
