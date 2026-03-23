import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export async function getViewerContext() {
  const [supabase, cookieStore, clerkAuth] = await Promise.all([
    createServerSupabaseClient(),
    cookies(),
    auth(),
  ]);

  return {
    supabase,
    user: clerkAuth.userId ? { id: clerkAuth.userId } : null,
    userId: clerkAuth.userId,
    isGuest: !clerkAuth.userId && cookieStore.get(GUEST_COOKIE_NAME)?.value === "1",
  };
}
