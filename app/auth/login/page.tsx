"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md animate-fade-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <h1 className="font-display text-2xl font-bold mt-4 mb-1">Welcome back</h1>
        <p className="text-[#8888aa] font-body text-sm">Sign in to your account</p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-2xl p-8">
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
              placeholder="••••••••"
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
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm font-body text-[#8888aa] mt-5">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="text-[#9d96ff] hover:text-[#6c63ff] transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
