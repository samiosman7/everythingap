"use client";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-sm font-body text-[#8888aa] hover:text-[#e8e8f0] border border-[#1e1e2e] hover:border-[#2a2a3a] rounded-lg transition-colors"
    >
      Sign out
    </button>
  );
}
