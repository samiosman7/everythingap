"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export default function LogoutButton({ isGuest = false }: { isGuest?: boolean }) {
  const router = useRouter();

  async function handleLogout() {
    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    const supabase = createClient();
    if (!isGuest) {
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-sm font-body text-[#8888aa] hover:text-[#e8e8f0] border border-[#1e1e2e] hover:border-[#2a2a3a] rounded-lg transition-colors"
    >
      {isGuest ? "Exit guest mode" : "Sign out"}
    </button>
  );
}
