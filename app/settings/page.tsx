import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getViewerContext } from "@/lib/viewer";
import { getCourseHref } from "@/lib/course";
import ThemeSettingsClient from "@/components/ThemeSettingsClient";

export default async function SettingsPage() {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");

  const [clerkUser, coursesResult] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji").order("name"),
  ]);

  const selectedCourses = (coursesResult.data ?? []).slice(0, 8).map(course => ({
    id: course.id,
    name: course.name,
    emoji: course.emoji,
    href: getCourseHref(course),
  }));

  return (
    <ThemeSettingsClient
      emailLabel={isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
      isGuest={isGuest}
      selectedCourses={selectedCourses}
    />
  );
}
