"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import GuestModeButton from "@/components/GuestModeButton";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-md animate-fade-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <h1 className="font-display text-2xl font-bold mt-4 mb-1">Create your account</h1>
        <p className="text-[#8888aa] font-body text-sm">Save your study path, quiz history, and progress in one place.</p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8">
        <div className="space-y-3">
          <GoogleSignInButton
            mode="signup"
            className="w-full py-3 bg-white hover:bg-[#f5f5f5] disabled:opacity-60 disabled:cursor-not-allowed text-[#111118] rounded-xl font-body font-semibold text-sm transition-colors"
          />
          <GuestModeButton
            className="w-full py-3 bg-[#0a0a0f] hover:bg-[#14141d] border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] rounded-xl font-body font-medium text-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-[#1e1e2e]" />
          <span className="text-xs font-body uppercase tracking-[0.2em] text-[#4c4c68]">or</span>
          <div className="h-px flex-1 bg-[#1e1e2e]" />
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-body font-medium text-[#8888aa] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] focus:border-[#6c63ff]/60 rounded-xl text-[#e8e8f0] font-body text-sm outline-none transition-colors placeholder:text-[#3a3a4a]"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium text-[#8888aa] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="At least 6 characters"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] focus:border-[#6c63ff]/60 rounded-xl text-[#e8e8f0] font-body text-sm outline-none transition-colors placeholder:text-[#3a3a4a]"
            />
          </div>
          <div>
            <label className="block text-sm font-body font-medium text-[#8888aa] mb-1.5">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              placeholder="Re-enter your password"
              className="w-full px-4 py-3 bg-[#0a0a0f] border border-[#1e1e2e] focus:border-[#6c63ff]/60 rounded-xl text-[#e8e8f0] font-body text-sm outline-none transition-colors placeholder:text-[#3a3a4a]"
            />
          </div>

          {error && (
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-body">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6c63ff] hover:bg-[#7c73ff] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-body font-semibold text-sm transition-colors"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm font-body text-[#8888aa] mt-5">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#9d96ff] hover:text-[#6c63ff] transition-colors">
          Sign in
        </Link>
      </p>
      <p className="text-center text-xs font-body text-[#4c4c68] mt-3">
        Want to look around first? Guest mode unlocks the app without saving progress.
      </p>
    </div>
  );
}
