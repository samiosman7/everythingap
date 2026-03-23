"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, UserRoundPlus } from "lucide-react";
import { SignUp } from "@clerk/nextjs";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

export default function Page() {
  useEffect(() => {
    document.cookie = `${GUEST_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="app-page py-10">
        <div className="grid gap-6 xl:grid-cols-[1fr,520px]">
          <section className="app-panel p-8 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Sparkles className="h-3.5 w-3.5" />
              Create account
            </div>
            <h1 className="app-title mt-5">Save your progress for real.</h1>
            <p className="app-copy mt-4 max-w-2xl">
              Make an account so your classes, progress, reflections, and next-step flow stay with you instead of disappearing when you leave guest mode.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {[
                "Sync your study progress across sessions.",
                "Keep your selected classes pinned to the dashboard and sidebar.",
                "Use the real setup tutorial across the actual app pages.",
                "Save FRQ feedback, notes, and reflections to your account.",
              ].map(item => (
                <div key={item} className="app-card p-4 text-sm leading-6 app-copy">
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/" className="app-secondary-button inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold">
                Back home
              </Link>
              <Link href="/sign-in" className="app-primary-button inline-flex items-center gap-2 px-4 py-3 text-sm">
                Already have an account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="app-panel p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3 px-2">
              <UserRoundPlus className="h-5 w-5 theme-accent" />
              <p className="text-sm font-semibold">Account setup</p>
            </div>
            <SignUp
              path="/sign-up"
              routing="path"
              signInUrl="/sign-in"
              forceRedirectUrl="/onboarding?tutorial=1"
              appearance={{
                elements: {
                  rootBox: "w-full",
                  cardBox: "w-full",
                  card: "shadow-none border rounded-[28px]",
                  headerTitle: "text-[var(--text)] text-2xl font-semibold",
                  headerSubtitle: "text-[var(--text-muted)]",
                  socialButtonsBlockButton: "border rounded-2xl shadow-none bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--panel-muted)]",
                  socialButtonsBlockButtonText: "text-[var(--text)] font-semibold",
                  dividerLine: "bg-[var(--line)]",
                  dividerText: "text-[var(--text-muted)]",
                  formFieldLabel: "text-[var(--text)]",
                  formFieldInput: "border rounded-2xl bg-[var(--surface)] text-[var(--text)] shadow-none",
                  formButtonPrimary: "rounded-2xl bg-[var(--accent)] text-white hover:opacity-95 shadow-none",
                  footerActionText: "text-[var(--text-muted)]",
                  footerActionLink: "text-[var(--accent)] hover:opacity-85",
                  formResendCodeLink: "text-[var(--accent)]",
                  identityPreviewText: "text-[var(--text)]",
                  identityPreviewEditButton: "text-[var(--accent)]",
                },
                variables: {
                  colorBackground: "var(--bg-elevated)",
                  colorInputBackground: "var(--surface)",
                  colorInputText: "var(--text)",
                  colorText: "var(--text)",
                  colorTextSecondary: "var(--text-muted)",
                  colorPrimary: "var(--accent)",
                  colorDanger: "var(--danger)",
                  borderRadius: "1rem",
                },
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
