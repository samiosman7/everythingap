import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
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
      {isGuest && (
        <div className="border-b border-[#6c63ff]/18 bg-[#6c63ff]/10 px-4 py-3 sm:px-6">
          <p className="font-body text-sm text-[#d9d7ff]">
            You&apos;re browsing in guest mode. Content is fully available, but synced progress only saves when you use an account.
          </p>
        </div>
      )}

      <DashboardClient
        courses={courses}
        emailLabel={isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
        isGuest={isGuest}
      />

      {!courses.length && (
        <div className="px-4 py-20 text-center font-body text-[#8888aa] sm:px-6">
          <div className="mb-4 text-4xl">AP</div>
          <p>No courses found yet. Populate the database and they&apos;ll appear here.</p>
        </div>
      )}
    </div>
  );
}
