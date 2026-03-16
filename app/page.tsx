"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import GuestModeButton from "@/components/GuestModeButton";
import { GUEST_COOKIE_NAME } from "@/lib/auth-constants";

const PREVIEW_COURSES = [
  { name: "AP Calculus BC", emoji: "Calc", color: "#2563eb" },
  { name: "AP Calculus AB", emoji: "AB", color: "#3b82f6" },
  { name: "AP Biology", emoji: "Bio", color: "#16a34a" },
  { name: "AP Chemistry", emoji: "Chem", color: "#7c3aed" },
  { name: "AP Physics 1", emoji: "Phys", color: "#0891b2" },
  { name: "AP Physics C: Mechanics", emoji: "Mech", color: "#0e7490" },
  { name: "AP US History", emoji: "USH", color: "#dc2626" },
  { name: "AP World History", emoji: "World", color: "#b45309" },
  { name: "AP European History", emoji: "Euro", color: "#6d28d9" },
  { name: "AP English Language", emoji: "Lang", color: "#92400e" },
  { name: "AP English Literature", emoji: "Lit", color: "#7c2d12" },
  { name: "AP Psychology", emoji: "Psych", color: "#be185d" },
];

const FEATURES = [
  { icon: "Notes", title: "Deep Chapter Notes", desc: "Clear chapter explainers written like a great teacher, not a dry textbook." },
  { icon: "Cards", title: "Smart Flashcards", desc: "Unit-by-unit flashcards for the concepts, formulas, people, and events that matter." },
  { icon: "Quiz", title: "Chapter Quizzes", desc: "Practice questions with explanations so students can learn while they check understanding." },
  { icon: "Exam", title: "Full Mock Exams", desc: "Complete AP-style practice with multiple choice, FRQs, and scoring guidance." },
  { icon: "Terms", title: "Key Concepts", desc: "Fast review for vocabulary, formulas, historical developments, and core theories." },
  { icon: "Prep", title: "Unit Exams", desc: "Bigger checks before the real test so students know what still needs work." },
];

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    setIsGuest(document.cookie.includes(`${GUEST_COOKIE_NAME}=1`));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#e8e8f0] overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-[#1e1e2e] bg-[#0a0a0f]/80 backdrop-blur-md">
        <span className="font-display font-bold text-lg tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </span>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {user || isGuest ? (
            <Link href="/dashboard" className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c73ff] text-white rounded-lg text-sm font-medium transition-colors font-body">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/auth/login" className="px-4 py-2 text-[#8888aa] hover:text-[#e8e8f0] text-sm font-body transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="px-4 py-2 bg-[#6c63ff] hover:bg-[#7c73ff] text-white rounded-lg text-sm font-medium transition-colors font-body">
                Get Started Free
              </Link>
              <GuestModeButton
                label="Guest Mode"
                className="px-4 py-2 bg-[#111118] hover:bg-[#1e1e2e] border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] rounded-lg text-sm font-medium transition-colors font-body"
              />
            </>
          )}
        </div>
      </nav>

      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-16 px-6 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#6c63ff]/8 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-[#2563eb]/6 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#6c63ff]/30 bg-[#6c63ff]/10 text-[#9d96ff] text-xs font-body font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6c63ff] animate-pulse" />
            38 AP courses · chapter notes · flashcards · quizzes · exams
          </div>

          <h1 className="font-display text-6xl md:text-8xl font-extrabold leading-[0.95] tracking-tight mb-6 animate-fade-up">
            The Complete
            <br />
            <span className="bg-gradient-to-r from-[#6c63ff] via-[#9d96ff] to-[#6c63ff] bg-clip-text text-transparent bg-[length:200%] animate-shimmer">
              AP Study Platform.
            </span>
          </h1>

          <p className="text-[#8888aa] text-lg md:text-xl font-body max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-100" style={{ opacity: 0, animation: "fadeUp 0.5s ease 0.1s forwards" }}>
            Notes, flashcards, practice quizzes, and full mock exams for every AP class, all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16" style={{ opacity: 0, animation: "fadeUp 0.5s ease 0.2s forwards" }}>
            <Link href="/auth/signup" className="px-8 py-3.5 bg-[#6c63ff] hover:bg-[#7c73ff] text-white rounded-xl text-base font-body font-semibold transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#6c63ff]/20">
              Start studying free
            </Link>
            <Link href="/auth/login" className="px-8 py-3.5 bg-[#111118] hover:bg-[#1e1e2e] border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] rounded-xl text-base font-body font-medium transition-all">
              Sign in
            </Link>
            <GuestModeButton
              className="px-8 py-3.5 bg-transparent hover:bg-[#111118] border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#8888aa] hover:text-[#e8e8f0] rounded-xl text-base font-body font-medium transition-all"
            />
          </div>

          <div className="relative" style={{ opacity: 0, animation: "fadeUp 0.5s ease 0.3s forwards" }}>
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
            <div className="flex gap-2 overflow-hidden">
              <div className="flex gap-2 animate-[scroll_30s_linear_infinite]">
                {[...PREVIEW_COURSES, ...PREVIEW_COURSES].map((c, i) => (
                  <span key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1e1e2e] bg-[#111118] text-sm font-body text-[#8888aa] whitespace-nowrap">
                    <span className="text-[#e8e8f0]">{c.emoji}</span>
                    <span>{c.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Everything you need to score a 5.
        </h2>
        <p className="text-[#8888aa] text-center font-body mb-14 text-base">No textbook required.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <div key={i} className="p-6 rounded-2xl bg-[#111118] border border-[#1e1e2e] hover:border-[#6c63ff]/40 transition-all group">
              <div className="text-xs font-body uppercase tracking-[0.2em] text-[#6c63ff] mb-3">{feature.icon}</div>
              <h3 className="font-display font-semibold text-base mb-2 group-hover:text-[#9d96ff] transition-colors">{feature.title}</h3>
              <p className="text-[#8888aa] text-sm font-body leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto p-10 rounded-3xl bg-[#111118] border border-[#1e1e2e] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c63ff]/8 to-transparent pointer-events-none" />
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative">Ready to ace your APs?</h2>
          <p className="text-[#8888aa] font-body mb-8 relative">Create an account to save progress, or jump in with guest mode right now.</p>
          <div className="relative flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/auth/signup" className="inline-block px-10 py-4 bg-[#6c63ff] hover:bg-[#7c73ff] text-white rounded-xl font-body font-semibold text-base transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#6c63ff]/20 relative">
              Get started free
            </Link>
            <GuestModeButton
              className="inline-block px-10 py-4 border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] rounded-xl font-body font-semibold text-base transition-colors relative"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1e1e2e] py-8 px-6 text-center text-[#8888aa] text-sm font-body">
        © 2025 EverythingAP. Built for students.
      </footer>

      <style jsx global>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
