"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { courseMinutes } from "@/lib/metrics";
import { formatDuration } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SiteFrame } from "./chrome";

export function PublicCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, enroll, hydrated } = useStore();
  const course = state.courses.find((item) => item.id === params.id);

  if (!hydrated) {
    return (
      <SiteFrame>
        <p className="mx-auto max-w-[760px] px-5 py-20 text-[14px] text-muted">Loading course…</p>
      </SiteFrame>
    );
  }
  const learner = state.sessionUserId ? state.users.find((user) => user.id === state.sessionUserId) : undefined;

  if (!course || course.status !== "published") {
    return (
      <SiteFrame>
        <div className="mx-auto max-w-[760px] px-5 py-20 sm:px-8">
          <h1 className="text-[32px] font-semibold">This course is not published.</h1>
          <p className="mt-3 text-[15px] leading-7 text-muted">Drafts and courses in review stay in the workspace.</p>
          <Link href="/courses" className="mt-6 inline-flex h-11 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Back to courses</Link>
        </div>
      </SiteFrame>
    );
  }

  const instructor = state.users.find((person) => person.id === course.instructorId);
  const enrolled = Boolean(learner && state.enrollments.some((item) => item.learnerId === learner.id && item.courseId === course.id));

  function start() {
    if (!learner) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course!.id}`)}`);
      return;
    }
    if (learner.role !== "learner") {
      router.push(learner.role === "admin" ? "/admin" : "/teach");
      return;
    }
    if (!enrolled) enroll(course!.id);
    router.push(`/learn/courses/${course!.id}`);
  }

  return (
    <SiteFrame>
      <div className="border-b border-line bg-shell">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
          <div>
            <p className="text-[12px] font-medium tracking-[0.16em] text-teal uppercase">{course.category}</p>
            <h1 className="mt-3 text-[36px] leading-[1.12] font-semibold tracking-tight sm:text-[48px]">{course.title}</h1>
            <p className="mt-4 max-w-xl text-[16px] leading-7 text-muted">{course.summary || course.overview}</p>
            <p className="mt-4 text-[13px] text-muted">{course.level} · {formatDuration(courseMinutes(course))}{instructor ? ` · ${instructor.name}` : ""}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button type="button" onClick={start} className="h-12 rounded-full bg-blue px-6 text-[14px] font-semibold text-[var(--on-action)]">{enrolled ? "Continue" : learner?.role === "learner" ? "Enroll" : "Sign in to enroll"}</button>
              <Link href="/courses" className="inline-flex h-12 items-center rounded-full border border-line px-6 text-[14px] font-semibold">All courses</Link>
            </div>
          </div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[14px]" style={{ background: course.coverTint || "#D8C8B8" }}>
            {course.cover ? <img src={course.cover} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-[#29231F]">{course.title}</span>}
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2">
        <div>
          <h2 className="text-[22px] font-semibold">Learning objectives</h2>
          {course.outcomes.filter(Boolean).length === 0 ? <p className="mt-3 text-[14px] text-muted">Objectives will appear when the instructor adds them.</p> : (
            <ul className="mt-4 space-y-3">
              {course.outcomes.filter(Boolean).map((outcome) => <li key={outcome} className="border-b border-line pb-3 text-[15px] leading-6">{outcome}</li>)}
            </ul>
          )}
        </div>
        <div>
          <h2 className="text-[22px] font-semibold">Curriculum</h2>
          <ul className="mt-4 space-y-4">
            {course.modules.map((module) => (
              <li key={module.id}>
                <p className="font-medium">{module.title}</p>
                <p className="text-[13px] text-muted">{module.lessons.length} lessons</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SiteFrame>
  );
}
