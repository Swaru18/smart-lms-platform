"use client";

import Link from "next/link";
import { useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, daysInMonth, formatDate, formatDuration, formatRate, initials, isoDate, shiftMonth, weekdayIndex } from "@/lib/format";
import { courseMinutes } from "@/lib/metrics";
import type { CalendarEvent, Course, DemoState, User } from "@/lib/types";
import { Button, Pill, ProgressBar } from "./ui";

export function KpiCard({
  href,
  label,
  value,
  hint,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Link href={href} className="block rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)] hover:border-blue/50">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-muted">{label}</p>
        <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-elevated text-ink">{icon}</span>
      </div>
      <p className="mt-3 text-[26px] font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 text-[12px] leading-5 text-muted">{hint}</p>
    </Link>
  );
}

function ChartTip({ active, payload, label }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[10px] border border-line bg-shell px-3 py-2 text-[12px] shadow-[var(--shadow)]">
      <p className="font-medium">{label} 2026</p>
      {payload.map((item) => (
        <p key={item.name} className="mt-1 text-muted">
          <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
          {item.name}: {item.value}
        </p>
      ))}
    </div>
  );
}

export function TrendChart({ data }: { data: Array<{ label: string; enrollments: number; completions: number }> }) {
  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="enrollments" name="Enrollments" stroke="var(--teal)" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="completions" name="Completions" stroke="var(--orange)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const engagementColor = {
  active: "var(--teal)",
  at_risk: "var(--orange)",
  inactive: "var(--muted)",
  completed: "var(--green)",
};

export function EngagementPanel({
  rows,
  total,
  hrefFor,
}: {
  rows: Array<{ key: "active" | "at_risk" | "inactive" | "completed"; label: string; count: number }>;
  total: number;
  hrefFor: (key: string) => string;
}) {
  return (
    <section className="rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]">
      <h2 className="text-[16px] font-semibold">Learner attention</h2>
      <p className="mt-1 text-[12px] leading-5 text-muted">Current state of {total} learners. Active means recent learning, not a login system.</p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-elevated" aria-hidden>
        {rows.map((row) => (
          <div key={row.key} style={{ width: total ? `${(row.count / total) * 100}%` : 0, background: engagementColor[row.key] }} />
        ))}
      </div>
      <ul className="mt-4 space-y-1">
        {rows.map((row) => (
          <li key={row.key}>
            <Link href={hrefFor(row.key)} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 hover:bg-elevated">
              <span className="flex items-center gap-2 text-[13px]">
                <span className="h-2 w-2 rounded-full" style={{ background: engagementColor[row.key] }} aria-hidden />
                {row.label}
              </span>
              <span className="text-[13px] tabular-nums">{row.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CourseHealth({
  rows,
  hrefFor,
}: {
  rows: Array<{ course: Course; enrolled: number; completed: number; rate: number }>;
  hrefFor: (course: Course) => string;
}) {
  return (
    <section className="rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-semibold">Courses needing attention</h2>
          <p className="mt-1 text-[12px] text-muted">Lowest completion among published courses with enrollments.</p>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-line">
        {rows.map((row) => {
          const attention = row.rate < 0.25;
          return (
            <li key={row.course.id} className="py-3">
              <Link href={hrefFor(row.course)} className="block rounded-[10px] hover:bg-elevated/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium">{row.course.title}</p>
                    <p className="text-[12px] text-muted">{row.completed} of {row.enrolled} enrollments completed</p>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 text-[12px]", attention ? "text-orange" : "text-muted")}>
                    {attention ? <AlertTriangle size={13} aria-hidden /> : null}
                    {attention ? "Needs attention" : "On track"}
                    <span className="ml-2 tabular-nums">{formatRate(row.completed, row.enrolled)}</span>
                  </span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={row.rate * 100} label={`${row.course.title} completion`} />
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function todayStamp() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function CalendarPanel({
  events,
  weekStartsOn,
  compact = false,
  onCreate,
}: {
  events: CalendarEvent[];
  weekStartsOn: "mon" | "sun";
  compact?: boolean;
  onCreate?: (input: { date: string; title: string; kind: CalendarEvent["kind"]; detail: string }) => string | null;
}) {
  const today = todayStamp();
  const [cursor, setCursor] = useState({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) });
  const [selected, setSelected] = useState(today);
  const [view, setView] = useState<"month" | "week" | "agenda">(compact ? "agenda" : "month");
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CalendarEvent["kind"]>("deadline");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | CalendarEvent["kind"]>("all");
  const visible = kindFilter === "all" ? events : events.filter((event) => event.kind === kindFilter);
  const count = daysInMonth(cursor.year, cursor.month);
  const first = weekdayIndex(cursor.year, cursor.month, 1);
  const offset = weekStartsOn === "mon" ? (first + 6) % 7 : first;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: count }, (_, index) => index + 1)];
  const labels = weekStartsOn === "mon" ? ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const selectedEvents = visible.filter((event) => event.date === selected);
  const later = visible.filter((event) => event.date > selected).slice(0, compact ? 3 : 6);
  const week = weekDates(selected, weekStartsOn);
  const agenda = visible.filter((event) => event.date >= today).slice(0, compact ? 4 : 12);
  const monthLabel = new Date(Date.UTC(cursor.year, cursor.month - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <section className="rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[16px] font-semibold">{monthLabel}</h2>
        <div className="flex flex-wrap items-center gap-1">
          {(["month", "week", "agenda"] as const).map((item) => (
            <button key={item} type="button" className={cn("h-8 rounded-[8px] px-2 text-[12px] capitalize", view === item ? "bg-[#CFAC87] text-[#392E27]" : "text-muted hover:bg-elevated")} onClick={() => setView(item)}>{item}</button>
          ))}
          <button type="button" className="h-8 rounded-[8px] px-2 text-[12px] hover:bg-elevated" onClick={() => { setSelected(today); setCursor({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }); }}>Today</button>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-elevated" aria-label="Previous month" onClick={() => setCursor((value) => shiftMonth(value.year, value.month, -1))}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-[8px] hover:bg-elevated" aria-label="Next month" onClick={() => setCursor((value) => shiftMonth(value.year, value.month, 1))}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {(["all", "deadline", "assessment", "session"] as const).map((item) => (
          <button key={item} type="button" className={cn("h-7 rounded-full px-2.5 text-[12px] capitalize", kindFilter === item ? "bg-[#EEE5DA] text-[#392E27]" : "text-muted hover:bg-elevated")} onClick={() => setKindFilter(item)}>{item === "all" ? "All dates" : item}</button>
        ))}
      </div>
      {view === "month" ? (
      <>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] text-muted">
        {labels.map((label) => <div key={label}>{label}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          const iso = isoDate(cursor.year, cursor.month, day);
          const has = visible.some((event) => event.date === iso);
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={cn(
                "relative h-8 rounded-[8px] text-[12px] tabular-nums",
                isSelected ? "bg-blue text-[var(--on-action)]" : "hover:bg-elevated",
                isToday && !isSelected && "ring-1 ring-teal",
              )}
              aria-pressed={isSelected}
              aria-label={`${formatDate(iso)}${has ? ", has events" : ""}`}
            >
              {day}
              {has ? <span className={cn("absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full", isSelected ? "bg-[var(--on-action)]" : "bg-teal")} /> : null}
            </button>
          );
        })}
      </div>
      </>
      ) : null}
      {view === "week" ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-7">
          {week.map((iso) => (
            <button key={iso} type="button" onClick={() => setSelected(iso)} className={cn("rounded-[10px] border border-line p-2 text-left", iso === selected && "bg-[#F7F2EA]")}>
              <span className="block text-[11px] text-muted">{formatDate(iso).slice(0, 6)}</span>
              <span className="mt-1 block text-[12px]">{visible.filter((event) => event.date === iso).length || "—"}</span>
            </button>
          ))}
        </div>
      ) : null}
      {view === "agenda" ? (
        <ul className="mt-3 space-y-2">
          {agenda.length === 0 ? <li className="text-[13px] text-muted">No upcoming dates.</li> : null}
          {agenda.map((event) => <EventRow key={event.id} event={event} />)}
        </ul>
      ) : null}
      <div className="mt-4">
        <p className="text-[12px] font-medium text-muted">{formatDate(selected)}</p>
        {selectedEvents.length === 0 ? <p className="mt-2 text-[13px] text-muted">Nothing scheduled on this date.</p> : null}
        <ul className="mt-2 space-y-2">
          {selectedEvents.map((event) => <EventRow key={event.id} event={event} />)}
        </ul>
        {later.length ? (
          <div className="mt-4">
            <p className="text-[12px] text-muted">Coming up after this date</p>
            <ul className="mt-2 space-y-2">
              {later.map((event) => <EventRow key={event.id} event={event} />)}
            </ul>
          </div>
        ) : null}
      </div>
      {onCreate ? (
        <form className="mt-4 grid gap-2 border-t border-line pt-4" onSubmit={(event) => {
          event.preventDefault();
          const message = onCreate({ date: selected, title, kind, detail });
          setError(message ?? "");
          if (!message) { setTitle(""); setDetail(""); }
        }}>
          <p className="text-[13px] font-medium">Add a date on {formatDate(selected)}</p>
          <input className="h-10 rounded-[10px] border border-line bg-canvas px-3 text-[13px]" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" aria-label="Event title" />
          <select className="h-10 rounded-[10px] border border-line bg-canvas px-3 text-[13px]" value={kind} onChange={(event) => setKind(event.target.value as CalendarEvent["kind"])} aria-label="Event type">
            <option value="deadline">Deadline</option>
            <option value="assessment">Assessment</option>
            <option value="session">Session</option>
          </select>
          <input className="h-10 rounded-[10px] border border-line bg-canvas px-3 text-[13px]" value={detail} onChange={(event) => setDetail(event.target.value)} placeholder="Short note" aria-label="Event note" />
          {error ? <p className="text-[12px] text-red">{error}</p> : null}
          <Button type="submit">Add event</Button>
        </form>
      ) : null}
    </section>
  );
}

function weekDates(iso: string, weekStartsOn: "mon" | "sun") {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const offset = weekStartsOn === "mon" ? (date.getUTCDay() + 6) % 7 : date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - offset);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(date);
    next.setUTCDate(date.getUTCDate() + index);
    return next.toISOString().slice(0, 10);
  });
}

function EventRow({ event }: { event: CalendarEvent }) {
  const tone = event.kind === "assessment" ? "blue" as const : event.kind === "deadline" ? "orange" as const : "teal" as const;
  return (
    <li className="rounded-[10px] bg-elevated px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-medium">{event.title}</p>
        <Pill tone={tone}>{event.kind}</Pill>
      </div>
      <p className="mt-1 text-[12px] leading-5 text-muted">{formatDate(event.date)} · {event.detail}</p>
    </li>
  );
}

export function CourseArt({ course, className }: { course: Pick<Course, "title" | "cover" | "coverTint">; className?: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(course.cover) && !failed;
  return (
    <div className={cn("relative aspect-video overflow-hidden bg-[var(--elevated)]", className)} style={{ background: course.coverTint || "#D8C8B8" }}>
      {showImage ? (
        <img src={course.cover} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span className="grid h-full place-items-center px-3 text-center text-[13px] font-medium text-[#29231F]">{course.title}</span>
      )}
    </div>
  );
}

export function CourseCard({
  course,
  instructor,
  href,
  action,
  progress,
  meta,
}: {
  course: Course;
  instructor?: User;
  href: string;
  action: string;
  progress?: number;
  meta?: string;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow)]">
      <Link href={href} className="block"><CourseArt course={course} /></Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[12px] text-muted">{course.category}{course.sample ? " · Sample" : ""}</p>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug">
          <Link href={href} className="hover:text-blue">{course.title}</Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted">{course.summary}</p>
        <p className="mt-3 text-[12px] text-muted">
          {instructor?.name ?? "Unassigned"} · {course.level} · {formatDuration(courseMinutes(course))}
        </p>
        {meta ? <p className="mt-1 text-[12px] text-muted">{meta}</p> : null}
        {typeof progress === "number" ? <div className="mt-3"><ProgressBar value={progress} label={`${course.title} progress`} /></div> : null}
        <div className="mt-4">
          <Link href={href} className="inline-flex h-10 w-full items-center justify-center rounded-[11px] bg-blue text-[14px] font-medium text-[var(--on-action)]">{action}</Link>
        </div>
      </div>
    </article>
  );
}

export function PersonRow({ person }: { person: User }) {
  return (
    <span className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full text-[11px] font-semibold text-[#29231F]" style={{ background: person.color }}>{person.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : initials(person.name)}</span>
      <span>
        <span className="block text-[13px] font-medium">{person.name}</span>
        <span className="block text-[12px] text-muted">{person.title}</span>
      </span>
    </span>
  );
}

export function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[14px] border border-line bg-card p-4 shadow-[var(--shadow)]", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function QuietLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="text-[13px] font-medium text-blue">{children}</Link>;
}

export { Button };
