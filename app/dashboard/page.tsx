import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import LogoutButton from "@/components/LogoutButton";
import { getViewerContext } from "@/lib/viewer";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");

  const [clerkUser, coursesResult, unitsResult, chaptersResult] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji, color, accent").order("name"),
    supabase.from("units").select("id, course_id"),
    supabase.from("chapters").select("id, unit_id"),
  ]);

  const units = unitsResult.data ?? [];
  const chapters = chaptersResult.data ?? [];

  const courses = (coursesResult.data ?? []).map(course => {
    const courseUnits = units.filter(unit => unit.course_id === course.id);

    return {
      ...course,
      units: courseUnits.map(unit => ({
        id: String(unit.id),
        chapterCount: chapters.filter(chapter => chapter.unit_id === unit.id).length,
      })),
    };
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[#1e1e2e] bg-[#0a0a0f]/90 px-6 py-4 backdrop-blur-md">
        <Link href="/" className="font-display text-lg font-bold tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden text-sm font-body text-[#8888aa] sm:block">
            {isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
          </span>
          <LogoutButton isGuest={isGuest} />
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {isGuest && (
          <div className="mb-8 rounded-2xl border border-[#6c63ff]/20 bg-[#6c63ff]/8 p-4">
            <p className="font-body text-sm text-[#d9d7ff]">
              You&apos;re browsing in guest mode. Content is fully available, but your resume button and progress bars only
              save on this device.
            </p>
          </div>
        )}

        <div className="mb-10">
          <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl">Your AP dashboard</h1>
          <p className="font-body text-[#8888aa]">
            Cleaner course organization, a real resume path, and progress that tells you what you&apos;ve already touched.
          </p>
        </div>

        <DashboardClient courses={courses} />

        {!courses.length && (
          <div className="py-20 text-center font-body text-[#8888aa]">
            <div className="mb-4 text-4xl">AP</div>
            <p>No courses found yet. Populate the database and they&apos;ll appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
