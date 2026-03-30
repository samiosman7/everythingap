"use client";

import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "hidden h-screen flex-shrink-0 overflow-hidden md:flex md:flex-col",
        "border-r",
        "w-[300px]",
        className
      )}
      style={{
        borderColor: "var(--line)",
        background: "linear-gradient(180deg, var(--panel) 0%, var(--bg-elevated) 100%)",
      }}
      animate={{
        width: animate ? (open ? "300px" : "72px") : "300px",
      }}
      transition={{
        duration: 0.16,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "flex w-full flex-row items-center justify-between border-b px-4 py-3 md:hidden"
        )}
        style={{
          borderColor: "var(--line)",
          background: "var(--panel)",
          paddingTop: "calc(0.75rem + var(--safe-top))",
          paddingLeft: "calc(1rem + var(--safe-left))",
          paddingRight: "calc(1rem + var(--safe-right))",
        }}
        {...props}
      >
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ color: "var(--text)", background: "var(--panel-muted)" }}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "fixed inset-0 z-[100] flex h-full w-full flex-col justify-between overflow-y-auto",
                className
              )}
              style={{
                background: "var(--bg)",
                paddingTop: "calc(1.25rem + var(--safe-top))",
                paddingBottom: "calc(1.25rem + var(--safe-bottom))",
                paddingLeft: "calc(1rem + var(--safe-left))",
                paddingRight: "calc(1rem + var(--safe-right))",
              }}
            >
              <div
                className="absolute z-50"
                style={{ color: "var(--text)" }}
                onClick={() => setOpen(!open)}
              >
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--panel-muted)",
                    marginTop: "var(--safe-top)",
                    marginRight: "var(--safe-right)",
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                  }}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  isActive = false,
  ...props
}: {
  link: Links;
  className?: string;
  isActive?: boolean;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      href={link.href}
      className={cn(
        "group/sidebar flex items-center justify-start gap-3 rounded-2xl px-2 py-3 transition-colors",
        className
      )}
      style={{
        color: isActive ? "var(--text)" : "var(--text-soft)",
        background: isActive ? "color-mix(in srgb, var(--accent-soft) 82%, transparent)" : undefined,
        border: isActive ? "1px solid color-mix(in srgb, var(--accent) 36%, transparent)" : undefined,
      }}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{
          duration: 0.12,
          ease: "easeOut",
        }}
        className="inline-block whitespace-pre !m-0 !p-0 text-sm transition duration-150 group-hover/sidebar:translate-x-1"
        style={{ color: "inherit" }}
      >
        {link.label}
      </motion.span>
    </Link>
  );
};
