"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpenText,
  Brain,
  Compass,
  GraduationCap,
  Home,
  Layers3,
  LayoutDashboard,
  Sparkles,
  Search,
} from "lucide-react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import LogoutButton from "@/components/LogoutButton";
import { cn } from "@/lib/utils";

type SidebarCourse = {
  id: string;
  name: string;
  emoji: string;
  href: string;
};

type DashboardSidebarProps = {
  emailLabel: string;
  isGuest: boolean;
  selectedCourses: SidebarCourse[];
};

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/dashboard" className="relative z-20 flex items-center gap-3 py-1 text-sm text-white">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-2xl bg-[#8b80ff] font-display text-sm font-bold text-white">
        AP
      </div>
      {!compact && <span className="whitespace-pre font-display text-base font-semibold">EverythingAP</span>}
    </Link>
  );
}

export default function DashboardSidebar({
  emailLabel,
  isGuest,
  selectedCourses,
}: DashboardSidebarProps) {
  const [open, setOpen] = useState(false);

  const primaryLinks = useMemo(
    () => [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Resume",
        href: "#resume-section",
        icon: <Compass className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Student Space",
        href: "/student-space",
        icon: <Brain className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "My Courses",
        href: "#my-courses",
        icon: <GraduationCap className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Browse All",
        href: "#browse-courses",
        icon: <Layers3 className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Pick Classes",
        href: "/onboarding",
        icon: <Search className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Setup Guide",
        href: "/setup-guide",
        icon: <Sparkles className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
      {
        label: "Home",
        href: "/",
        icon: <Home className="h-5 w-5 flex-shrink-0 text-neutral-200" />,
      },
    ],
    []
  );

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-8 border-r border-white/8 bg-[#0b0b12]">
        <div className="flex h-full flex-1 flex-col justify-between px-4 py-4">
          <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <Logo compact />}

            <div className="mt-8 flex flex-col gap-2">
              {primaryLinks.map(link => (
                <SidebarLink key={link.label} link={link} />
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-6">
              <div
                className={cn(
                  "mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#77738b]",
                  !open && "hidden"
                )}
              >
                Selected classes
              </div>
              <div className="flex flex-col gap-1.5">
                {selectedCourses.slice(0, 5).map(course => (
                  <SidebarLink
                    key={course.id}
                    link={{
                      label: course.name,
                      href: course.href,
                      icon: (
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center text-base">
                          {course.emoji}
                        </span>
                      ),
                    }}
                    className="py-2"
                  />
                ))}
                {!selectedCourses.length && open && (
                  <div className="rounded-2xl border border-dashed border-white/10 px-3 py-3 text-xs leading-5 text-[#8985a2]">
                    Choose your AP classes in onboarding and they&apos;ll stay pinned here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3 py-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#8b80ff]/20 text-sm font-semibold text-white">
                <BookOpenText className="h-4 w-4" />
              </div>
              {open && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{emailLabel}</p>
                  <p className="text-xs text-[#8b87a3]">{isGuest ? "Guest session" : "Signed in"}</p>
                </div>
              )}
            </div>
            <LogoutButton
              isGuest={isGuest}
              className="w-full rounded-2xl border-white/10 bg-white/5 px-4 py-3 text-left text-[#d5d2e8] hover:bg-white/10"
            />
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
