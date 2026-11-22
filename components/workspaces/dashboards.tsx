"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ClipboardCheck, GraduationCap, Plus, Users } from "lucide-react";
import { formatLongDate, formatRate, formatWhen, greeting } from "@/lib/format";
import {
  enrollmentView,
  learnerEnrollments,
  orgCompletion,
  peopleForInstructor,
  sessionUser,
  submissionsFor,
  userById,
} from "@/lib/metrics";
import { useStore } from "@/lib/store";
import { DEMO_TODAY } from "@/lib/types";
import { UserDialog } from "../user-dialog";
import { Button, EmptyState, PageHeader, Pill } from "../ui";
import { CalendarPanel, CourseArt, KpiCard, Panel, QuietLink } from "../widgets";
import { ProgressBar } from "../ui";

export function AdminHome() {
  const { state } = useStore();
  const [invite, setInvite] = useState(false);
  const person = sessionUser(state, "admin");
  const completion = orgCompletion(state);
  const students = state.users.filter((user) => user.role === "learner").length;
  const instructors = state.users.filter((user) => user.role === "instructor").length;
  const published = state.courses.filter((course) => course.status === "published").length;
  const pendingApprovals = state.users.filter((user) => user.status === "invited").length + state.courses.filter((course) => course.status === "in_review").length;
  const recentEnrollments = [...state.enrollments].sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt)).slice(0, 6);
  const activity = state.activity.filter((item) => item.roles.includes("admin")).slice(0, 6);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={formatLongDate(DEMO_TODAY)}
        title={person ? greeting(person.name) : "Overview"}
        description="Users, courses and approvals."
        actions={
          <>
            <Button variant="secondary" onClick={() => setInvite(true)}>Add student</Button>
            <Link href="/admin/courses/new" className="inline-flex h-10 items-center gap-2 rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]"><Plus size={16} /> Create course</Link>
          </>
        }
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
        <KpiCard href="/admin/users" label="Total users" value={String(state.users.length)} hint="Accounts stored on this browser" icon={<Users size={16} />} />
        <KpiCard href="/admin/instructors" label="Instructors" value={String(instructors)} hint="Includes accounts waiting for approval" icon={<GraduationCap size={16} />} />
        <KpiCard href="/admin/users" label="Students" value={String(students)} hint="Registered student profiles" icon={<Users size={16} />} />
        <KpiCard href="/admin/courses" label="Published courses" value={String(published)} hint={`${state.courses.length} courses in total`} icon={<BookOpen size={16} />} />
        <KpiCard href="/admin/instructors" label="Pending approvals" value={String(pendingApprovals)} hint="Instructor accounts and courses in review" icon={<ClipboardCheck size={16} />} />
        <KpiCard href="/admin/reports" label="Course completion" value={completion.total ? formatRate(completion.completed, completion.total) : "—"} hint={completion.total ? `${completion.completed} of ${completion.total} enrollments` : "Analytics will appear as learning activity grows."} icon={<ClipboardCheck size={16} />} />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel title="Recent enrollments" action={<QuietLink href="/admin/enrollments">All enrollments</QuietLink>}>
            {recentEnrollments.length === 0 ? <p className="text-[13px] text-muted">Students will appear when they register or enroll.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-[13px]">
                  <thead className="text-muted"><tr><th className="py-2 font-medium">Student</th><th className="py-2 font-medium">Course</th><th className="py-2 font-medium">Enrolled</th><th className="py-2 font-medium">Progress</th><th className="py-2 font-medium">Status</th></tr></thead>
                  <tbody>
                    {recentEnrollments.map((enrollment) => {
                      const learner = userById(state, enrollment.learnerId);
                      const course = state.courses.find((item) => item.id === enrollment.courseId);
                      if (!learner || !course) return null;
                      const view = enrollmentView(course, enrollment);
                      return (
                        <tr key={enrollment.id} className="border-t border-line">
                          <td className="py-3">{learner.name}</td>
                          <td className="py-3">{course.title}</td>
                          <td className="py-3">{formatLongDate(enrollment.enrolledAt)}</td>
                          <td className="py-3 w-36"><ProgressBar value={view.total ? (view.done / view.total) * 100 : 0} label={`${learner.name} progress`} /></td>
                          <td className="py-3 capitalize">{view.status.replace("_", " ")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
        <div className="space-y-4 xl:col-span-4">
          <CalendarPanel events={state.events} weekStartsOn={state.settings.weekStartsOn} compact />
          <Panel title="Recent activity">
            {activity.length === 0 ? <p className="text-[13px] text-muted">Activity will appear as people use the workspace.</p> : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li key={item.id}>
                    <p className="text-[13px] leading-5">{item.text}</p>
                    <p className="text-[11px] text-muted">{formatWhen(item.at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
      <Panel title="Courses" action={<QuietLink href="/admin/courses">Manage courses</QuietLink>}>
        {state.courses.length === 0 ? <p className="text-[13px] text-muted">Your courses will appear here.</p> : (
          <ul className="grid gap-3 md:grid-cols-2">
            {state.courses.slice(0, 4).map((course) => (
              <li key={course.id}>
                <Link href={`/admin/courses/${course.id}`} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 rounded-[12px] border border-line p-2 hover:border-blue/40">
                  <CourseArt course={course} className="h-16 w-24" />
                  <span>
                    <span className="block text-[14px] font-medium">{course.title}</span>
                    <span className="mt-1 block text-[12px] text-muted">{userById(state, course.instructorId)?.name ?? "Unassigned"} · {course.status.replace("_", " ")}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <UserDialog open={invite} onClose={() => setInvite(false)} />
    </div>
  );
}

export function TeachHome() {
  const { state } = useStore();
  const person = sessionUser(state, "instructor");
  if (!person) return null;
  const mine = state.enrollments.filter((item) => state.courses.find((course) => course.id === item.courseId)?.instructorId === person.id);
  const completion = orgCompletion(state, mine);
  const learners = peopleForInstructor(state, person.id);
  const reviews = submissionsFor(state, person.id);
  const pending = reviews.filter((item) => item.status === "pending");
  const published = state.courses.filter((course) => course.instructorId === person.id && course.status === "published").length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={formatLongDate(DEMO_TODAY)}
        title={greeting(person.name)}
        description="Your courses, the learners on them, and the reviews still open."
        actions={<Link href="/teach/reviews" className="inline-flex h-10 items-center rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]">Open review queue</Link>}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard href="/teach/courses" label="Published courses" value={String(published)} hint="Drafts stay off the catalogue" icon={<BookOpen size={16} />} />
        <KpiCard href="/teach/learners" label="Learners" value={String(learners.length)} hint="Unique people on your courses" icon={<Users size={16} />} />
        <KpiCard href="/teach/analytics" label="Completion rate" value={formatRate(completion.completed, completion.total)} hint={`${completion.completed} of ${completion.total} enrollments`} icon={<ClipboardCheck size={16} />} />
        <KpiCard href="/teach/reviews?status=pending" label="Pending reviews" value={String(pending.length)} hint="Waiting for a score and a note" icon={<ClipboardCheck size={16} />} />
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Panel className="xl:col-span-7" title="Needs a review" action={<QuietLink href="/teach/reviews">All reviews</QuietLink>}>
          {pending.length === 0 ? <p className="text-[13px] text-muted">Assignments created for your courses will appear here.</p> : (
          <ul className="divide-y divide-line">
            {pending.map((submission) => {
              const learner = state.users.find((user) => user.id === submission.learnerId);
              const course = state.courses.find((item) => item.id === submission.courseId);
              return (
                <li key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-[14px] font-medium">{submission.title}</p>
                    <p className="text-[12px] text-muted">{learner?.name} · {course?.title}</p>
                  </div>
                  <Link href={`/teach/reviews/${submission.id}`} className="text-[13px] font-medium text-blue">Grade</Link>
                </li>
              );
            })}
          </ul>
          )}
        </Panel>
        <Panel className="xl:col-span-5" title="Recent activity">
          {state.activity.filter((item) => item.roles.includes("instructor") && (!item.instructorId || item.instructorId === person.id)).length === 0 ? <p className="text-[13px] text-muted">Analytics will appear as learning activity grows.</p> : (
          <ul className="space-y-3">
            {state.activity.filter((item) => item.roles.includes("instructor") && (!item.instructorId || item.instructorId === person.id)).slice(0, 5).map((item) => (
              <li key={item.id}>
                <p className="text-[13px] leading-5">{item.text}</p>
                <p className="text-[12px] text-muted">{formatWhen(item.at)}</p>
              </li>
            ))}
          </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

export function LearnHome() {
  const { state } = useStore();
  const person = sessionUser(state, "learner");
  if (!person) return null;
  const rows = learnerEnrollments(state, person.id);
  const current = rows.find((row) => row.view.status === "in_progress") ?? rows.find((row) => row.view.status !== "completed");
  const inProgress = rows.filter((row) => row.view.status === "in_progress").length;
  const completed = rows.filter((row) => row.view.status === "completed").length;
  const today = new Date().toISOString().slice(0, 10);
  const deadlines = (rows.length
    ? state.events.filter((event) => event.date >= today && rows.some((row) => row.course.id === event.courseId))
    : state.events.filter((event) => event.date >= today)
  ).slice(0, 3);
  const featured = state.courses.filter((course) => course.status === "published").slice(0, 3);
  const activity = state.activity.filter((item) => item.learnerId === person.id).slice(0, 4);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={formatLongDate(today)}
        title={greeting(person.name)}
        description="Continue a course, or explore what is published."
      />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {current ? (
            <article className="overflow-hidden rounded-[14px] border border-line bg-card shadow-[var(--shadow)] lg:grid lg:grid-cols-5">
              <div className="lg:col-span-2">
                <CourseArt course={current.course} className="h-48 lg:h-full lg:aspect-auto" />
              </div>
              <div className="p-5 lg:col-span-3">
                <p className="text-[12px] font-medium text-teal">Continue learning</p>
                <h2 className="mt-1 text-[22px] font-semibold leading-tight">{current.course.title}</h2>
                <p className="mt-2 text-[14px] text-muted">{current.view.next ? `${current.view.next.module.title} · ${current.view.next.title}` : "Course complete"}</p>
                <p className="mt-3 text-[13px] text-muted">{current.view.done} of {current.view.total} lessons · {current.view.progress}%</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-elevated"><div className="h-full bg-teal" style={{ width: `${current.view.progress}%` }} /></div>
                {current.view.next ? (
                  <Link href={`/learn/courses/${current.course.id}/lessons/${current.view.next.id}`} className="mt-5 inline-flex h-10 items-center rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]">Resume lesson</Link>
                ) : null}
              </div>
            </article>
          ) : (
            <EmptyState title="Start a course" body="The catalogue includes sample courses you can enroll in. Your progress starts only after you enroll." action={<Link href="/learn/catalogue" className="inline-flex h-10 items-center rounded-[11px] bg-[#CFAC87] px-3.5 text-[14px] font-medium text-[#392E27]">Explore courses</Link>} />
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
          <Link href="/learn/catalogue" className="rounded-[14px] border border-line bg-card p-4">
            <p className="text-[13px] text-muted">In progress</p>
            <p className="mt-1 text-[26px] font-semibold">{inProgress}</p>
          </Link>
          <Link href="/learn/achievements" className="rounded-[14px] border border-line bg-card p-4">
            <p className="text-[13px] text-muted">Completed courses</p>
            <p className="mt-1 text-[26px] font-semibold">{completed}</p>
          </Link>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={rows.length ? "Upcoming for you" : "Sample dates"}>
          {deadlines.length === 0 ? <p className="text-[13px] text-muted">Deadlines will appear when a course includes them.</p> : (
          <ul className="space-y-3">
            {deadlines.map((event) => (
              <li key={event.id} className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium">{event.title}</p>
                  <p className="text-[12px] text-muted">{formatLongDate(event.date)}</p>
                </div>
                <Pill tone={event.kind === "deadline" ? "orange" : "blue"}>{event.kind}</Pill>
              </li>
            ))}
          </ul>
          )}
        </Panel>
        <Panel title="Recent activity">
          {activity.length === 0 ? <p className="text-[13px] text-muted">Your learning activity will appear here.</p> : (
          <ul className="space-y-3">
            {activity.map((item) => (
              <li key={item.id}>
                <p className="text-[13px] leading-5">{item.text}</p>
                <p className="text-[12px] text-muted">{formatWhen(item.at)}</p>
              </li>
            ))}
          </ul>
          )}
        </Panel>
      </div>
      {!current && featured.length ? (
        <section>
          <h2 className="text-[16px] font-semibold">Available courses</h2>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {featured.map((course) => (
              <li key={course.id}>
                <Link href={`/learn/catalogue/${course.id}`} className="block overflow-hidden rounded-[14px] border border-line bg-card">
                  <CourseArt course={course} />
                  <span className="block p-3">
                    <span className="text-[12px] text-muted">{course.category}{course.sample ? " · Sample" : ""}</span>
                    <span className="mt-1 block text-[15px] font-semibold">{course.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
