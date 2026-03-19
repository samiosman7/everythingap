"use client";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";
import { cn } from "@/lib/utils";

export default function LogoutButton({ isGuest = false, className }: { isGuest?: boolean; className?: string }) {
  const router = useRouter();
  const { signOut } = useClerk();

  async function handleLogout() {
    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    if (!isGuest) {
      await signOut({ redirectUrl: "/" });
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className={cn(
        "rounded-lg border border-[#1e1e2e] px-3 py-1.5 text-sm font-body text-[#8888aa] transition-colors hover:border-[#2a2a3a] hover:text-[#e8e8f0]",
        className
      )}
    >
      {isGuest ? "Exit guest mode" : "Sign out"}
    </button>
  );
}
