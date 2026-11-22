"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/format";

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/courses", label: "Courses" },
  { href: "/institutions", label: "For Institutions" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
] as const;

function SocialLinks({ className }: { className?: string }) {
  const items = [
    { label: "LinkedIn channel note", path: "M4.5 3.2A1.3 1.3 0 1 0 4.5 5.8 1.3 1.3 0 0 0 4.5 3.2zM3.4 6.6h2.2V13H3.4V6.6zM8 6.6h2.1v.9h.1c.3-.5 1-1.1 2.1-1.1 2.2 0 2.6 1.5 2.6 3.4V13H12.7V10c0-.7 0-1.6-1-1.6s-1.1.8-1.1 1.6V13H8.4V6.6H8z" },
    { label: "Instagram channel note", path: "M6 2.5h4A3.5 3.5 0 0 1 13.5 6v4A3.5 3.5 0 0 1 10 13.5H6A3.5 3.5 0 0 1 2.5 10V6A3.5 3.5 0 0 1 6 2.5zm0 1.2A2.3 2.3 0 0 0 3.7 6v4A2.3 2.3 0 0 0 6 12.3h4A2.3 2.3 0 0 0 12.3 10V6A2.3 2.3 0 0 0 10 3.7H6zM8 5.4A2.6 2.6 0 1 1 8 10.6 2.6 2.6 0 0 1 8 5.4zm0 1.2a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8zM11.3 4.5a.7.7 0 1 1 0 1.4.7.7 0 0 1 0-1.4z" },
    { label: "YouTube channel note", path: "M13.6 4.6c.8.2 1.4.8 1.6 1.6.3 1.2.3 3.8.3 3.8s0 2.6-.3 3.8a2 2 0 0 1-1.6 1.6C12.4 15.6 8 15.6 8 15.6s-4.4 0-5.6-.2a2 2 0 0 1-1.6-1.6C.5 12.6.5 10 .5 10s0-2.6.3-3.8a2 2 0 0 1 1.6-1.6C3.6 4.4 8 4.4 8 4.4s4.4 0 5.6.2zM6.6 12.2 10.4 10 6.6 7.8v4.4z" },
  ];
  return (
    <span className={cn("flex items-center gap-3", className)}>
      {items.map((item) => (
        <Link key={item.label} href="/contact#channels" aria-label={item.label} className="hover:opacity-70">
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
            <path d={item.path} />
          </svg>
        </Link>
      ))}
    </span>
  );
}

export function Mark({ className }: { className?: string }) {
  return (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-[#CFAC87] text-[#392E27]", className)} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2.2 4.2h13.6M2.2 4.2v9.1c2.3-1.35 4.7-1.35 6.8 0 2.1-1.35 4.5-1.35 6.8 0V4.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    </span>
  );
}

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 outline-offset-4">
      <Mark />
      <span className="leading-tight">
        <span className={cn("block font-display text-[16px] font-semibold tracking-tight", light ? "text-white" : "text-ink")}>Smart LMS</span>
        <span className={cn("block text-[11px]", light ? "text-white/55" : "text-muted")}>Learning platform</span>
      </span>
    </Link>
  );
}

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:bg-white focus:px-3 focus:py-2 focus:text-[#172437]">Skip to content</a>
      <SiteHeader />
      <motion.main
        id="content"
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const pathname = usePathname();
  const { state, toggleTheme } = useStore();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-[#E8E0D7] bg-[#F6F2EC] text-[12px] text-[#756B63]">
        <div className="mx-auto flex h-9 max-w-[1180px] items-center gap-4 px-5 sm:px-8">
          <p className="truncate">Welcome to Smart LMS</p>
          <span className="h-3 w-px bg-white/15" aria-hidden />
          <p className="hidden truncate md:block">Courses, teaching and progress in one learning platform</p>
          <div className="ml-auto flex items-center gap-4">
            <a className="hover:text-[#29231F]" href="mailto:support@smartlms.example">support@smartlms.example</a>
            <span className="hidden h-3 w-px bg-white/15 lg:block" aria-hidden />
            <p className="hidden lg:block">Mon–Fri, 9:00–18:00</p>
            <span className="hidden h-3 w-px bg-white/15 sm:block" aria-hidden />
            <SocialLinks />
          </div>
        </div>
      </div>
      <div className="border-b border-[#E8E0D7] bg-[#FCFAF7] text-[#29231F]">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-4 px-5 sm:px-8">
          <Wordmark />
          <nav className="ml-8 hidden items-center gap-6 xl:flex" aria-label="Primary">
            {NAV.map((item) => {
              const active = isCurrent(pathname, item.href);
              return (
                <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={cn("group relative py-2 text-[13.5px] transition-colors", active ? "text-[#29231F]" : "text-[#756B63] hover:text-[#29231F]")}>
                  {item.label}
                  <span className={cn("absolute right-0 -bottom-0.5 left-0 h-px origin-left bg-[#87715F] transition-transform duration-300", active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <button type="button" aria-label="Search courses" onClick={() => setSearchOpen(true)} className="grid h-10 w-10 place-items-center rounded-full text-[#756B63] hover:bg-[#F6F2EC] hover:text-[#29231F]">
              <Search size={16} />
            </button>
            <button type="button" aria-label={state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme} className="grid h-10 w-10 place-items-center rounded-full text-[#756B63] hover:bg-[#F6F2EC] hover:text-[#29231F]">
              {state.theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href="/login" className="hidden h-10 items-center px-3 text-[13.5px] text-[#756B63] hover:text-[#29231F] sm:inline-flex">Sign in</Link>
            <Link href="/signup" className="hidden h-10 items-center rounded-full bg-[#CFAC87] px-4 text-[13.5px] font-semibold text-[#392E27] md:inline-flex">Create account</Link>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[#29231F] xl:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute inset-x-0 top-full z-40 border-b border-[#E8E0D7] bg-[#FCFAF7] px-5 py-4 text-[#29231F] xl:hidden"
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="grid gap-1" aria-label="Mobile">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} className={cn("border-b border-[#E8E0D7] py-3 text-[16px]", isCurrent(pathname, item.href) ? "text-[#87715F]" : "text-[#29231F]")}>{item.label}</Link>
              ))}
            </nav>
            <div className="mt-4 flex gap-3">
              <Link href="/login" className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-[#E8E0D7] text-[14px]">Sign in</Link>
              <Link href="/signup" className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-[#CFAC87] text-[14px] font-semibold text-[#392E27]">Create account</Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <CourseSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function CourseSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const reduce = useReducedMotion();
  const { state } = useStore();
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const published = state.courses.filter((course) => course.status === "published");
    if (!needle) return published.slice(0, 5);
    return published.filter((course) => `${course.title} ${course.category} ${course.summary}`.toLowerCase().includes(needle)).slice(0, 6);
  }, [query, state.courses]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 bg-[#111B29]/55" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }} onClick={onClose}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search courses"
            className="mx-auto mt-24 w-[min(640px,calc(100%-2rem))] bg-white p-4 text-[#172437] shadow-[0_24px_60px_rgba(17,27,41,0.28)]"
            style={{ colorScheme: "light" }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 8 }}
            onClick={(event) => event.stopPropagation()}
          >
            <label className="block text-[12px] text-[#756B63]" htmlFor="site-search">Search published courses</label>
            <input
              id="site-search"
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Course title, category or topic"
              className="mt-2 h-11 w-full border border-[#d7e0ea] px-3 text-[15px] outline-none focus:border-[#20B6A5]"
            />
            <ul className="mt-3 divide-y divide-[#e7eef5]">
              {results.length === 0 ? <li className="py-4 text-[14px] text-[#756B63]">No published course matches that search.</li> : results.map((course) => (
                <li key={course.id}>
                  <button
                    type="button"
                    className="flex w-full items-baseline justify-between gap-4 py-3 text-left hover:text-[#129c91]"
                    onClick={() => {
                      onClose();
                      router.push(`/courses/${course.id}`);
                    }}
                  >
                    <span>
                      <span className="block text-[15px] font-medium">{course.title}</span>
                      <span className="block text-[12px] text-[#748196]">{course.category}</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-[#748196]">{course.level}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-2 text-[13px] text-[#4C83EB]" onClick={() => { onClose(); router.push(query.trim() ? `/courses?q=${encodeURIComponent(query.trim())}` : "/courses"); }}>
              Open the full catalogue
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E9DFD4] bg-[#EEE5DA] text-[#392E27]">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-[14px] leading-6 text-[#756B62]">Courses, teaching and progress in one place. Accounts in this release stay in the browser until Supabase is connected.</p>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#87715F] uppercase">Product</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li><Link className="hover:text-[#87715F]" href="/features">Platform features</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/courses">Course catalogue</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/institutions">For institutions</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/login">Sign in</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#87715F] uppercase">Learning</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li><Link className="hover:text-[#87715F]" href="/resources">Resources</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/about">About the platform</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/demo">Book a demo</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/contact">Support</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-[#87715F] uppercase">Support</p>
          <ul className="mt-4 space-y-2 text-[14px]">
            <li><a className="hover:text-[#87715F]" href="mailto:support@smartlms.example">support@smartlms.example</a></li>
            <li>Mon–Fri, 9:00–18:00</li>
            <li><Link className="hover:text-[#87715F]" href="/privacy">Privacy Policy</Link></li>
            <li><Link className="hover:text-[#87715F]" href="/terms">Terms and Conditions</Link></li>
          </ul>
          <SocialLinks className="mt-4" />
        </div>
      </div>
      <div className="border-t border-[#E3D4C4]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-5 py-4 text-[12px] text-[#756B62] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 Smart LMS.</p>
          <p>Accounts in this release stay in this browser.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageIntro({ eyebrow, title, lede }: { eyebrow: string; title: string; lede: string }) {
  return (
    <div className="border-b border-line bg-shell">
      <div className="mx-auto max-w-[1180px] px-5 py-14 sm:px-8 sm:py-16">
        <p className="text-[12px] font-medium tracking-[0.16em] text-teal uppercase">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.12] font-semibold tracking-[-0.03em] sm:text-[48px]">{title}</h1>
        <p className="mt-4 max-w-2xl text-[16px] leading-7 text-muted">{lede}</p>
      </div>
    </div>
  );
}
