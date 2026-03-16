"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

type GoogleSignInButtonProps = {
  mode: "signin" | "signup";
  className?: string;
};

export default function GoogleSignInButton({
  mode,
  className,
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setLoading(false);
      window.location.href = `/auth/login?error=${encodeURIComponent(error.message)}`;
    }
  }

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={className}
    >
      {loading
        ? "Connecting to Google..."
        : mode === "signup"
          ? "Continue with Google"
          : "Sign in with Google"}
    </button>
  );
}
