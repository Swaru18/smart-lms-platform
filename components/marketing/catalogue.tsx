"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { courseMinutes } from "@/lib/metrics";
import { formatDuration } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PageIntro, SiteFrame } from "./chrome";

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export function CataloguePage() {
  const params = useSearchParams();
  const router = useRouter();
  const { state, hydrated } = useStore();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "All";
  const level = params.get("level") ?? "All";
  const published = state.courses.filter((course) => course.status === "published");
  const categories = ["All", ...Array.from(new Set(published.map((course) => course.category)))];

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return published.filter((course) => {
      if (category !== "All" && course.category !== category) return false;
      if (level !== "All" && course.level !== level) return false;
      if (!needle) return true;
      const instructor = state.users.find((person) => person.id === course.instructorId)?.name ?? "";
      return `${course.title} ${course.summary} ${course.category} ${instructor}`.toLowerCase().includes(needle);
    });
  }, [q, category, level, published, state.users]);

  function update(next: { q?: string; category?: string; level?: string }) {
    const search = new URLSearchParams();
    const query = next.q ?? q;
    const nextCategory = next.category ?? category;
    const nextLevel = next.level ?? level;
    if (query.trim()) search.set("q", query.trim());
    if (nextCategory !== "All") search.set("category", nextCategory);
    if (nextLevel !== "All") search.set("level", nextLevel);
    const suffix = search.toString();
    router.replace(suffix ? `/courses?${suffix}` : "/courses", { scroll: false });
  }

  return (
    <SiteFrame>
      <PageIntro eyebrow="Catalogue" title="Published courses." lede="Search by title, category or level." />
      <div className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8">
        <div className="grid gap-3 border-b border-line pb-6 md:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="block text-[12px] font-medium text-muted">
            Search
            <input className="field mt-1.5" value={q} onChange={(event) => update({ q: event.target.value })} placeholder="Title or topic" />
          </label>
          <label className="block text-[12px] font-medium text-muted">
            Category
            <select className="field mt-1.5" value={category} onChange={(event) => update({ category: event.target.value })}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-[12px] font-medium text-muted">
            Level
            <select className="field mt-1.5" value={level} onChange={(event) => update({ level: event.target.value })}>
              {levels.map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
        </div>
        {!hydrated ? <p className="mt-6 text-[14px] text-muted">Loading courses…</p> : null}
        {hydrated ? <p className="mt-5 text-[13px] text-muted">{results.length} course{results.length === 1 ? "" : "s"}</p> : null}
        {hydrated && results.length === 0 ? (
          <div className="mt-6 rounded-[14px] border border-dashed border-line px-6 py-10 text-center">
            <h2 className="text-[16px] font-semibold">No courses yet</h2>
            <p className="mt-2 text-[14px] text-muted">Published courses will appear here.</p>
          </div>
        ) : null}
        {hydrated && results.length > 0 ? (
          <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((course) => {
              const instructor = state.users.find((person) => person.id === course.instructorId);
              return (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}`} className="group block rounded-[14px] border border-line bg-card p-3">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-[10px]" style={{ background: course.coverTint || "#D8C8B8" }}>
                      {course.cover ? <img src={course.cover} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-[13px] text-[#29231F]">{course.title}</span>}
                    </div>
                    <p className="mt-3 text-[12px] tracking-[0.12em] text-muted uppercase">{course.category}</p>
                    <h2 className="mt-1 text-[18px] font-semibold tracking-tight">{course.title}</h2>
                    <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-muted">{course.summary}</p>
                    <p className="mt-3 text-[12px] text-muted">{course.level} · {formatDuration(courseMinutes(course))}{instructor ? ` · ${instructor.name}` : ""}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </SiteFrame>
  );
}
