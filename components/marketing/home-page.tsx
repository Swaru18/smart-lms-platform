"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, Presentation, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { SiteFrame } from "./chrome";

const points = [
  { icon: BookOpen, title: "Courses", text: "Draft a course, add lessons, and publish when it is ready." },
  { icon: Presentation, title: "Teaching", text: "Instructors manage their courses, reviews and student progress." },
  { icon: Users, title: "Students", text: "Learners enroll, continue a lesson and see what is next." },
  { icon: ClipboardCheck, title: "Progress", text: "Completion is counted from finished lessons." },
];

export function HomePage() {
  const { state } = useStore();
  const published = state.courses.filter((course) => course.status === "published").slice(0, 3);

  return (
    <SiteFrame>
      <section className="border-b border-line bg-shell">
        <div className="mx-auto grid max-w-[1100px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-24">
          <div>
            <p className="text-[12px] font-medium tracking-[0.16em] text-[#87715F] uppercase">Smart LMS</p>
            <h1 className="mt-3 max-w-xl text-[40px] leading-[1.08] font-semibold tracking-tight sm:text-[52px]">Learn, teach and track progress.</h1>
            <p className="mt-4 max-w-md text-[16px] leading-7 text-muted">A calm workspace for courses, instructors and students.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex h-11 items-center rounded-full bg-[#CFAC87] px-5 text-[14px] font-semibold text-[#392E27]">Create account</Link>
              <Link href="/courses" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] font-semibold">Browse courses</Link>
            </div>
          </div>
          <div className="rounded-[16px] border border-line bg-card p-5">
            <h2 className="text-[18px] font-semibold">Start here</h2>
            <p className="mt-2 text-[14px] leading-6 text-muted">Create a student or instructor account on this browser.</p>
            <Link href="/signup" className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-[11px] bg-[#CFAC87] text-[14px] font-semibold text-[#392E27]">Create account</Link>
            <p className="mt-3 text-center text-[13px] text-muted">Already registered? <Link className="text-[#87715F]" href="/login">Sign in</Link></p>
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto grid max-w-[1100px] gap-6 px-5 py-14 sm:px-8 md:grid-cols-2 lg:grid-cols-4">
          {points.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-[14px] border border-line bg-card p-4">
                <Icon size={18} className="text-[#87715F]" aria-hidden />
                <h2 className="mt-3 text-[16px] font-semibold">{item.title}</h2>
                <p className="mt-1 text-[14px] leading-6 text-muted">{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="border-t border-line bg-[#F7F2EA]">
        <div className="mx-auto grid max-w-[1100px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            ["1", "Create an account", "Students can start immediately. Instructors wait for approval."],
            ["2", "Open a course", "Read the lessons, then enroll when you want progress saved."],
            ["3", "Finish the work", "Submit an assignment or a short assessment, then check the calendar."],
          ].map(([step, title, text]) => (
            <article key={step}>
              <p className="text-[12px] font-medium text-[#87715F]">Step {step}</p>
              <h2 className="mt-2 text-[18px] font-semibold">{title}</h2>
              <p className="mt-1 text-[14px] leading-6 text-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1100px] px-5 py-14 sm:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-[28px] font-semibold tracking-tight">Published courses</h2>
            <Link href="/courses" className="text-[14px] font-medium text-[#87715F]">View all</Link>
          </div>
          {published.length === 0 ? (
            <p className="mt-6 text-[14px] text-muted">Published courses will appear here.</p>
          ) : (
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {published.map((course) => (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}`} className="block rounded-[14px] border border-line bg-card p-4">
                    <p className="text-[12px] text-muted">{course.category}{course.sample ? " · Sample" : ""}</p>
                    <h3 className="mt-1 text-[16px] font-semibold">{course.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-muted">{course.summary}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </SiteFrame>
  );
}
