"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import GuestModeButton from "@/components/GuestModeButton";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (authError) {
      setError(authError);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-md animate-fade-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <h1 className="font-display text-2xl font-bold mt-4 mb-1">Welcome back</h1>
        <p className="text-[#8888aa] font-body text-sm">Sign in to save your progress across every AP course.</p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8">
        <div className="space-y-3">
          <GoogleSignInButton
            mode="signin"
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

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Password"
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
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm font-body text-[#8888aa] mt-5">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="text-[#9d96ff] hover:text-[#6c63ff] transition-colors">
          Sign up free
        </Link>
      </p>
      <p className="text-center text-xs font-body text-[#4c4c68] mt-3">
        Guest mode lets you explore the full platform, but your progress will not be saved.
      </p>
    </div>
  );
}
