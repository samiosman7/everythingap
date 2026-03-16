import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export async function getViewerContext() {
  const [supabase, cookieStore] = await Promise.all([
    createServerSupabaseClient(),
    cookies(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    supabase,
    user,
    isGuest: cookieStore.get(GUEST_COOKIE_NAME)?.value === "1",
  };
}
