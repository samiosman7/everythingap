"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, RotateCw } from "lucide-react";
import { createClient } from "@/lib/supabase";

export default function ConfirmEmailClient({ email }: { email?: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (!email) {
      setMessage("Add your email on the sign up page so we know where to resend the link.");
      return;
    }

    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setLoading(false);
    setMessage(
      error
        ? `We couldn't resend it yet: ${error.message}`
        : "Fresh confirmation link sent. Check inbox and spam."
    );
  }

  return (
    <div className="relative z-10 w-full max-w-xl animate-fade-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <h1 className="font-display text-3xl font-bold mt-4 mb-2">Confirm your email</h1>
        <p className="text-[#8888aa] font-body text-sm max-w-md mx-auto leading-relaxed">
          We&apos;ve prepared your study dashboard. Confirm your email so we can save progress and sync your AP plan.
        </p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-3xl p-8 md:p-10">
        <div className="w-14 h-14 rounded-2xl bg-[#6c63ff]/12 border border-[#6c63ff]/20 flex items-center justify-center text-2xl mb-6 mx-auto">
          <MailCheck className="h-7 w-7 text-[#b9b4ff]" />
        </div>

        <div className="text-center mb-8">
          <p className="text-[#8888aa] font-body text-sm">Email sent to</p>
          <p className="text-[#e8e8f0] font-body font-semibold text-base mt-2 break-all">
            {email ?? "your inbox"}
          </p>
        </div>

        <div className="grid gap-3 mb-8">
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">1. Check inbox and spam</p>
            <p className="font-body text-sm text-[#8888aa]">The default auth email can take a minute to arrive.</p>
          </div>
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">2. Tap the confirmation link</p>
            <p className="font-body text-sm text-[#8888aa]">You&apos;ll return here automatically and then go to your dashboard.</p>
          </div>
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">3. Need another email?</p>
            <p className="font-body text-sm text-[#8888aa]">Use resend below. If nothing arrives, your Supabase email provider probably still needs setup.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] disabled:opacity-60 text-white font-body font-semibold text-sm transition-colors"
          >
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Resending..." : "Resend confirmation"}
          </button>
          <Link
            href="/auth/login"
            className="flex-1 py-3 text-center rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] font-body font-medium text-sm transition-colors"
          >
            Back to sign in
          </Link>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[#2a2a3a] bg-[#0a0a0f] p-4 text-sm font-body text-[#c8c8df]">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
