import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getViewerContext } from "@/lib/viewer";
import StudentSpaceClient from "@/components/student/StudentSpaceClient";

export default async function StudentSpacePage() {
  const { supabase, userId, isGuest } = await getViewerContext();
  if (!userId && !isGuest) redirect("/sign-in");

  const [clerkUser, coursesResult] = await Promise.all([
    isGuest ? Promise.resolve(null) : currentUser(),
    supabase.from("courses").select("id, slug, name, emoji, color, accent").order("name"),
  ]);

  return (
    <StudentSpaceClient
      courses={coursesResult.data ?? []}
      emailLabel={isGuest ? "Guest mode" : clerkUser?.primaryEmailAddress?.emailAddress ?? "Signed in"}
      isGuest={isGuest}
    />
  );
}
