"use client";

import { useRouter } from "next/navigation";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

type GuestModeButtonProps = {
  className?: string;
  label?: string;
  href?: string;
};

export default function GuestModeButton({
  className,
  label = "Continue as guest",
  href = "/dashboard",
}: GuestModeButtonProps) {
  const router = useRouter();

  function handleGuestMode() {
    document.cookie = `${GUEST_COOKIE_NAME}=1; path=/; max-age=604800; samesite=lax`;
    router.push(href);
    router.refresh();
  }

  return (
    <button type="button" onClick={handleGuestMode} className={className}>
      {label}
    </button>
  );
}
