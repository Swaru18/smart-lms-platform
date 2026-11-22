"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  Moon,
  PanelLeft,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
  UserRound,
} from "lucide-react";
import { answerCompanion, COMPANION_PROMPTS } from "@/lib/companion";
import { cn, formatWhen, initials } from "@/lib/format";
import { navFor, ROLE_HOME, ROLE_LABEL, roleFromPath, titleFromPath } from "@/lib/nav";
import { searchRecords, sessionUser } from "@/lib/metrics";
import { authRepository } from "@/lib/services/auth-repository";
import { useStore } from "@/lib/store";
import { Button, ConfirmDialog, Drawer, IconButton, SkeletonBlock } from "./ui";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3 rounded-[10px] outline-offset-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-blue text-[var(--on-action)]" aria-hidden>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M2.2 4.2h13.6M2.2 4.2v9.1c2.3-1.35 4.7-1.35 6.8 0 2.1-1.35 4.5-1.35 6.8 0V4.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      {compact ? null : (
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-display text-[15px] font-semibold tracking-tight">Smart LMS</span>
          <span className="block truncate text-[11px] text-muted">Learning platform</span>
        </span>
      )}
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { state } = useStore();
  const items = navFor(state.role);
  const collapsed = state.sidebarCollapsed;
  let previousGroup = "";
  return (
    <nav className="space-y-1" aria-label="Workspace">
      {items.map((item) => {
        const showGroup = !collapsed && item.group !== previousGroup;
        previousGroup = item.group;
        const active = pathname === item.href || (item.href !== ROLE_HOME[state.role] && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <div key={item.href}>
            {showGroup ? <p className="px-3 pt-3 pb-1 text-[11px] font-medium tracking-wide text-muted">{item.group}</p> : null}
          <Link
            href={item.href}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
            className={cn(
              "relative flex min-h-10 items-center gap-3 rounded-[10px] px-3 text-[14px]",
              active ? "bg-elevated font-medium text-ink" : "text-muted hover:bg-elevated hover:text-ink",
              collapsed && "justify-center px-0",
            )}
          >
            {active ? <span className="absolute top-2 bottom-2 left-0 w-0.5 rounded-full bg-teal" /> : null}
            <Icon size={18} aria-hidden />
            {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
          </Link>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { state, setSidebarCollapsed, logout } = useStore();
  const router = useRouter();
  const person = sessionUser(state);
  const collapsed = state.sidebarCollapsed && !onNavigate;
  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center", collapsed ? "justify-center px-2" : "px-3")}>
        <Logo compact={collapsed} />
      </div>
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-2">
        <NavLinks onNavigate={onNavigate} />
      </div>
      <div className="mt-auto px-3 pt-4">
        {person ? (
          <Link href="/account" onClick={onNavigate} className={cn("flex items-center gap-3 rounded-[12px] px-1 py-2 hover:bg-elevated", collapsed && "justify-center")}>
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full text-[12px] font-semibold text-[#29231F]" style={{ background: person.color }}>
              {person.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : initials(person.name)}
            </span>
            {collapsed ? null : (
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium">{person.name}</span>
                <span className="block truncate text-[12px] text-muted">{person.title}</span>
              </span>
            )}
          </Link>
        ) : null}
        <button
          type="button"
          title="Sign out"
          className={cn("mt-2 flex h-10 w-full items-center gap-2 rounded-[10px] px-3 text-[13px] text-muted hover:bg-elevated hover:text-ink", collapsed && "justify-center px-0")}
          onClick={() => {
            onNavigate?.();
            logout();
            router.push("/");
          }}
        >
          <LogOut size={16} />
          {collapsed ? <span className="sr-only">Sign out</span> : "Sign out"}
        </button>
        <button
          type="button"
          className="mt-2 hidden h-10 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] text-muted hover:bg-elevated hover:text-ink lg:flex"
          onClick={() => setSidebarCollapsed(!state.sidebarCollapsed)}
        >
          <ChevronLeft size={16} className={cn(state.sidebarCollapsed && "rotate-180")} />
          {collapsed ? <span className="sr-only">Expand sidebar</span> : "Collapse"}
        </button>
      </div>
    </div>
  );
}

function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const results = useMemo(() => {
    const found = searchRecords(state, query);
    const pages = navFor(state.role).filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()));
    return {
      pages: query.trim() ? pages : navFor(state.role).slice(0, 4),
      courses: found.courses.slice(0, 5),
      people: state.role === "learner" ? [] : found.people.slice(0, 5),
    };
  }, [query, state]);
  const flat = [
    ...results.pages.map((item) => ({ href: item.href, label: item.label, kind: "Page" })),
    ...results.courses.map((course) => ({
      href: state.role === "learner" ? `/learn/courses/${course.id}` : state.role === "instructor" ? `/teach/courses/${course.id}` : `/admin/courses/${course.id}`,
      label: course.title,
      kind: "Course",
    })),
    ...results.people.map((person) => ({ href: "/admin/people", label: person.name, kind: person.role })),
  ];

  useEffect(() => { setIndex(0); }, [query, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <button type="button" className="absolute inset-0 bg-[var(--scrim)]" aria-label="Close search" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Search" className="relative w-full max-w-xl overflow-hidden rounded-[16px] border border-line bg-shell shadow-[var(--shadow)]">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search courses, people, pages"
            className="h-12 w-full bg-transparent text-[14px] outline-none"
            onKeyDown={(event) => {
              if (event.key === "Escape") onClose();
              if (event.key === "ArrowDown") { event.preventDefault(); setIndex((value) => Math.min(flat.length - 1, value + 1)); }
              if (event.key === "ArrowUp") { event.preventDefault(); setIndex((value) => Math.max(0, value - 1)); }
              if (event.key === "Enter" && flat[index]) {
                router.push(flat[index].href);
                onClose();
              }
            }}
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {flat.length === 0 ? <li className="px-3 py-6 text-center text-[13px] text-muted">Nothing matches that search.</li> : null}
          {flat.map((item, itemIndex) => (
            <li key={`${item.kind}-${item.label}`}>
              <button
                type="button"
                className={cn("flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-left text-[14px]", itemIndex === index ? "bg-elevated" : "hover:bg-elevated")}
                onMouseEnter={() => setIndex(itemIndex)}
                onClick={() => { router.push(item.href); onClose(); }}
              >
                <span>{item.label}</span>
                <span className="text-[12px] text-muted">{item.kind}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StudyCompanion() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-30 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-shell px-4 text-[13px] font-medium shadow-[var(--shadow)] hover:bg-elevated"
      >
        <Sparkles size={16} className="text-teal" />
        Study companion
      </button>
      <Drawer open={open} title="Study companion" onClose={() => setOpen(false)}>
        <p className="text-[13px] leading-6 text-muted">Demo — simulated responses. These answers are prepared examples. Nothing is sent to a model.</p>
        <div className="mt-4 space-y-2">
          {COMPANION_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              type="button"
              className="w-full rounded-[12px] border border-line px-3 py-2 text-left text-[13px] hover:bg-elevated"
              onClick={() => { setQuestion(prompt.question); setAnswer(prompt.answer); }}
            >
              {prompt.question}
            </button>
          ))}
        </div>
        <label className="mt-4 block text-[13px] font-medium" htmlFor="companion-q">Ask a prepared question</label>
        <textarea id="companion-q" className="field mt-1.5 min-h-20" value={question} onChange={(event) => setQuestion(event.target.value)} />
        <Button className="mt-3" onClick={() => setAnswer(answerCompanion(question))} disabled={!question.trim()}>Show prepared answer</Button>
        {answer ? (
          <div className="mt-4 rounded-[12px] border border-line bg-elevated p-3">
            <p className="text-[12px] font-medium text-teal">Prepared answer</p>
            <p className="mt-2 text-[13px] leading-6">{answer}</p>
          </div>
        ) : null}
      </Drawer>
    </>
  );
}

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const { hydrated, state, toggleTheme, resetDemo, markNotification, markAllNotifications, logout } = useStore();
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const notesRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const person = sessionUser(state);
  const title = titleFromPath(pathname, state.role);
  const notes = state.notifications.filter((item) => item.roles.includes(state.role));
  const unread = notes.filter((item) => !item.read).length;

  useEffect(() => {
    if (!hydrated) return;
    if (!person) {
      if (authRepository.readSession()) return;
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (person.status !== "active") return;
    const area = roleFromPath(pathname);
    if (area && area !== person.role) router.replace(ROLE_HOME[person.role]);
  }, [hydrated, pathname, person, router]);

  useEffect(() => {
    document.title = `${title} · Smart LMS`;
  }, [title]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (notesRef.current && !notesRef.current.contains(event.target as Node)) setNotesOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotesOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (!hydrated || !person) {
    return (
      <div className="min-h-screen bg-canvas p-6">
        <SkeletonBlock className="h-14 w-full" />
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="mt-4 h-80" />
      </div>
    );
  }

  if (person.status !== "active") {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6">
        <div className="max-w-md rounded-[14px] border border-line bg-card p-6">
          <h1 className="text-[22px] font-semibold">{person.status === "suspended" ? "Account suspended" : "Waiting for approval"}</h1>
          <p className="mt-2 text-[14px] leading-6 text-muted">
            {person.status === "suspended"
              ? "An administrator has suspended this account."
              : "An administrator needs to activate this instructor account before the workspace opens."}
          </p>
          <button type="button" className="mt-4 h-10 rounded-[11px] bg-blue px-4 text-[14px] text-[var(--on-action)]" onClick={() => { logout(); router.push("/login"); }}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-[10px] focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
      <aside className={cn("fixed inset-y-0 left-0 z-20 hidden border-r border-line bg-shell py-4 lg:block", state.sidebarCollapsed ? "w-[76px]" : "w-[248px]")}>
        <SidebarBody />
      </aside>
      <Drawer open={mobileNav} title="Smart LMS" side="left" onClose={() => setMobileNav(false)}>
        <SidebarBody onNavigate={() => setMobileNav(false)} />
      </Drawer>
      <div className={cn("min-w-0", state.sidebarCollapsed ? "lg:pl-[76px]" : "lg:pl-[248px]")}>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-line bg-shell/95 px-3 backdrop-blur-sm sm:px-5">
          <IconButton label="Open navigation" className="lg:hidden" onClick={() => setMobileNav(true)}><Menu size={18} /></IconButton>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-muted">{state.role === "admin" ? `Admin / ${title}` : `${ROLE_LABEL[state.role]} workspace`}</p>
            <p className="truncate text-[14px] font-medium">{title}</p>
          </div>
          <button type="button" onClick={() => setSearchOpen(true)} className="hidden h-10 min-w-0 items-center gap-2 rounded-[11px] border border-line bg-card px-3 text-[13px] text-muted md:flex md:w-64">
            <Search size={15} />
            <span className="flex-1 text-left">Search</span>
            <span className="text-[11px]">Ctrl K</span>
          </button>
          <IconButton label="Search" className="md:hidden" onClick={() => setSearchOpen(true)}><Search size={18} /></IconButton>
          <div className="relative" ref={notesRef}>
            <IconButton label={unread ? `${unread} unread notifications` : "Notifications"} onClick={() => setNotesOpen((value) => !value)}>
              <Bell size={18} />
            </IconButton>
            {unread ? <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-orange px-1 text-[10px] font-semibold text-[#1a120c]">{unread}</span> : null}
            {notesOpen ? (
              <div className="absolute right-0 mt-2 w-[min(100vw-2rem,340px)] rounded-[14px] border border-line bg-shell p-2 shadow-[var(--shadow)]">
                <div className="flex items-center justify-between px-2 py-1">
                  <p className="text-[13px] font-medium">Notifications</p>
                  <button type="button" className="text-[12px] text-blue" onClick={markAllNotifications}>Mark all read</button>
                </div>
                <ul>
                  {notes.length === 0 ? <li className="px-2 py-4 text-[13px] text-muted">No notifications yet.</li> : null}
                  {notes.map((note) => (
                    <li key={note.id}>
                      <Link
                        href={note.href}
                        className="block rounded-[10px] px-2 py-2 hover:bg-elevated"
                        onClick={() => { markNotification(note.id, true); setNotesOpen(false); }}
                      >
                        <span className="flex items-center gap-2 text-[13px] font-medium">
                          {!note.read ? <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden /> : null}
                          {note.title}
                          {!note.read ? <span className="sr-only">Unread</span> : null}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-5 text-muted">{note.body}</span>
                        <span className="mt-1 block text-[11px] text-muted">{formatWhen(note.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <IconButton label={state.theme === "dark" ? "Switch to light theme" : "Switch to dark theme"} onClick={toggleTheme}>
            {state.theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </IconButton>
          <div className="relative" ref={profileRef}>
            <button type="button" className="grid h-10 w-10 place-items-center overflow-hidden rounded-full text-[12px] font-semibold text-[#29231F]" style={{ background: person.color }} aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen((value) => !value)}>
              <span className="sr-only">Account menu</span>
              {person.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : initials(person.name)}
            </button>
            {profileOpen ? (
              <div role="menu" className="absolute right-0 mt-2 w-56 rounded-[14px] border border-line bg-shell p-1.5 shadow-[var(--shadow)]">
                <p className="px-2 py-2 text-[12px] text-muted">{person.name}<br />{person.email}<br />{ROLE_LABEL[person.role]}</p>
                <Link href="/account" role="menuitem" className="flex items-center gap-2 rounded-[8px] px-2 py-2 text-[13px] hover:bg-elevated" onClick={() => setProfileOpen(false)}><UserRound size={15} /> Profile</Link>
                {state.role === "admin" ? <Link href="/admin/settings" role="menuitem" className="flex items-center gap-2 rounded-[8px] px-2 py-2 text-[13px] hover:bg-elevated" onClick={() => setProfileOpen(false)}>Settings</Link> : null}
                {state.role === "admin" ? <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[13px] hover:bg-elevated" onClick={() => { setProfileOpen(false); setResetOpen(true); }}><RotateCcw size={15} /> Clear learning records</button> : null}
                <button type="button" role="menuitem" className="flex w-full items-center gap-2 rounded-[8px] px-2 py-2 text-left text-[13px] hover:bg-elevated" onClick={() => { logout(); router.push("/"); }}><LogOut size={15} /> Sign out</button>
              </div>
            ) : null}
          </div>
        </header>
        <main id="content" className="mx-auto w-full max-w-[1360px] px-4 py-6 sm:px-6 lg:px-8">
          <motion.div key={pathname} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.18 }}>
            {children}
          </motion.div>
        </main>
      </div>
      {state.role === "learner" ? <StudyCompanion /> : null}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ConfirmDialog
        open={resetOpen}
        title="Clear learning records?"
        body="Courses, enrollments, submissions and notifications are removed from this browser. Accounts stay."
        confirmLabel="Clear records"
        tone="danger"
        onClose={() => setResetOpen(false)}
        onConfirm={() => { resetDemo(); setResetOpen(false); }}
      />
    </div>
  );
}

export function ShellFallback() {
  return (
    <div className="min-h-screen bg-canvas p-6">
      <div className="flex items-center gap-2 text-muted"><PanelLeft size={16} /> Loading workspace</div>
    </div>
  );
}
