 "use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { SignIn } from "@clerk/nextjs";
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
              Sign in
            </div>
            <h1 className="app-title mt-5">Jump back into your AP flow.</h1>
            <p className="app-copy mt-4 max-w-2xl">
              Pick up where you left off, reopen your notes, and get back to quizzes, flashcards, FRQs, and full AP review without digging around for the right page.
            </p>

            <div className="mt-8 grid gap-3 md:grid-cols-2">
              {[
                "Resume where you left off automatically.",
                "Keep your classes, notes, and confidence signals synced to your account.",
                "Use the real guided setup after sign-up instead of a fake tutorial page.",
                "Switch themes in settings once you are inside.",
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
              <Link href="/sign-up" className="app-primary-button inline-flex items-center gap-2 px-4 py-3 text-sm">
                Create account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="app-panel p-4 sm:p-6">
            <div className="mb-5 flex items-center gap-3 px-2">
              <ShieldCheck className="h-5 w-5 theme-accent" />
              <p className="text-sm font-semibold">Secure sign-in</p>
            </div>
            <SignIn
              path="/sign-in"
              routing="path"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
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
