"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatDate, formatRate, formatWhen, relativeToDemo } from "@/lib/format";
import {
  attentionCourses,
  courseRows,
  filteredEnrollments,
  monthlyTrend,
  orgCompletion,
  peopleForInstructor,
  sessionUser,
  submissionsFor,
  userById,
} from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { Audience, Engagement, Role } from "@/lib/types";
import { UserDialog } from "../user-dialog";
import { Button, Drawer, EmptyState, PageHeader, Pill } from "../ui";
import { CalendarPanel, Panel, PersonRow, TrendChart } from "../widgets";

const engagementLabel: Record<Engagement, string> = {
  active: "Active",
  at_risk: "At risk",
  inactive: "Inactive",
  completed: "Completed",
};

export function PeoplePage() {
  const params = useSearchParams();
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<Role | "all">("all");
  const [status, setStatus] = useState("all");
  const [engagement, setEngagement] = useState(params.get("engagement") ?? "all");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [sort, setSort] = useState<"name" | "activity">("name");
  const rows = state.users
    .filter((user) => (role === "all" ? true : user.role === role))
    .filter((user) => (status === "all" ? true : user.status === status))
    .filter((user) => (engagement === "all" ? true : user.engagement === engagement))
    .filter((user) => `${user.name} ${user.email} ${user.title}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "activity" ? b.lastActive.localeCompare(a.lastActive) : a.name.localeCompare(b.name));
  const selected = state.users.find((user) => user.id === editing);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="People" title="Roster" description="Search, filter and edit demo records. Nothing is invited by email." actions={<Button onClick={() => setEditing("new")}>Add person</Button>} />
      <div className="grid gap-3 md:grid-cols-4">
        <input className="field md:col-span-1" placeholder="Search name or email" aria-label="Search people" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Role" value={role} onChange={(event) => setRole(event.target.value as Role | "all")}>
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="learner">Learner</option>
        </select>
        <select className="field" aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="field" aria-label="Learning state" value={engagement} onChange={(event) => setEngagement(event.target.value)}>
          <option value="all">All learning states</option>
          <option value="active">Active</option>
          <option value="at_risk">At risk</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex gap-2 text-[13px]">
        <button type="button" className={sort === "name" ? "font-medium text-blue" : "text-muted"} onClick={() => setSort("name")}>Sort by name</button>
        <button type="button" className={sort === "activity" ? "font-medium text-blue" : "text-muted"} onClick={() => setSort("activity")}>Sort by last active</button>
      </div>
      {rows.length === 0 ? <EmptyState title="No one matches" body="Try another role, status or search." /> : null}
      <div className="hidden overflow-x-auto rounded-[14px] border border-line md:block">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-elevated text-muted">
            <tr>
              <th className="px-3 py-2 font-medium" aria-sort={sort === "name" ? "ascending" : "none"}>Name</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Learning</th>
              <th className="px-3 py-2 font-medium">Last active</th>
              <th className="px-3 py-2 font-medium"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-3 py-3"><PersonRow person={user} /></td>
                <td className="px-3 py-3 capitalize">{user.role}</td>
                <td className="px-3 py-3 capitalize">{user.status}</td>
                <td className="px-3 py-3">{user.engagement ? engagementLabel[user.engagement] : "—"}</td>
                <td className="px-3 py-3">{relativeToDemo(user.lastActive)}</td>
                <td className="px-3 py-3 text-right"><button type="button" className="text-blue" onClick={() => setEditing(user.id)}>Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((user) => (
          <li key={user.id} className="rounded-[14px] border border-line bg-card p-3">
            <PersonRow person={user} />
            <p className="mt-2 text-[12px] text-muted capitalize">{user.role} · {user.status} · {user.engagement ? engagementLabel[user.engagement] : "staff"} · {relativeToDemo(user.lastActive)}</p>
            <button type="button" className="mt-2 text-[13px] text-blue" onClick={() => setEditing(user.id)}>Edit</button>
          </li>
        ))}
      </ul>
      <UserDialog open={editing !== null} initial={editing && editing !== "new" ? selected : null} onClose={() => setEditing(null)} />
    </div>
  );
}

export function CourseManager({ base }: { base: "/admin/courses" | "/teach/courses" }) {
  const params = useSearchParams();
  const { state } = useStore();
  const actor = sessionUser(state);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [category, setCategory] = useState("all");
  const [mine, setMine] = useState(state.role === "instructor");
  const rows = state.courses.filter((course) => {
    if (status !== "all" && course.status !== status) return false;
    if (category !== "all" && course.category !== category) return false;
    if (mine && course.instructorId !== actor?.id) return false;
    return `${course.title} ${course.summary}`.toLowerCase().includes(query.trim().toLowerCase());
  });
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Courses" title={state.role === "admin" ? "Catalogue management" : "Your teaching"} description="Drafts stay out of the learner catalogue until you publish them." actions={<Link href={`${base}/new`} className="inline-flex h-10 items-center rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]">Create course</Link>} />
      <div className="grid gap-3 md:grid-cols-3">
        <input className="field" placeholder="Search courses" aria-label="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Draft and published</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select className="field" aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {state.categories.map((item) => <option key={item.id}>{item.name}</option>)}
        </select>
      </div>
      {state.role === "instructor" ? <label className="flex items-center gap-2 text-[13px]"><input type="checkbox" checked={mine} onChange={(event) => setMine(event.target.checked)} /> Only courses I teach</label> : null}
      {rows.length === 0 ? <EmptyState title="No courses" body="Create a draft or clear the filters." /> : null}
      <ul className="grid gap-3">
        {rows.map((course) => {
          const stats = courseRows(state).find((row) => row.course.id === course.id);
          return (
            <li key={course.id}>
              <Link href={`${base}/${course.id}`} className="block rounded-[14px] border border-line bg-card p-4 hover:border-blue/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[12px] text-muted">{course.category} · {userById(state, course.instructorId)?.name}</p>
                    <h2 className="text-[16px] font-semibold">{course.title}</h2>
                    <p className="mt-1 text-[13px] text-muted">{course.summary || "No summary yet."}</p>
                  </div>
                  <Pill tone={course.status === "published" ? "teal" : "neutral"}>{course.status}</Pill>
                </div>
                {stats ? <p className="mt-3 text-[12px] text-muted">{stats.enrolled} enrolled · {formatRate(stats.completed, stats.enrolled)} completion</p> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      {state.role === "admin" ? <CategoryEditor /> : null}
    </div>
  );
}

function CategoryEditor() {
  const { state, addCategory } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  return (
    <section className="rounded-[14px] border border-line bg-card p-4">
      <h2 className="text-[16px] font-semibold">Categories</h2>
      <ul className="mt-3 space-y-2">
        {state.categories.map((category) => (
          <li key={category.id} className="flex items-start justify-between gap-3 text-[13px]">
            <span><span className="font-medium">{category.name}</span><span className="block text-muted">{category.description || "No description"}</span></span>
            <span className="text-muted">{state.courses.filter((course) => course.category === category.name).length}</span>
          </li>
        ))}
      </ul>
      <form className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); setError(addCategory(name, description) ?? ""); if (!error) { setName(""); setDescription(""); } }}>
        <input className="field" placeholder="New category" aria-label="Category name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="field" placeholder="Short description" aria-label="Category description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <Button type="submit">Add</Button>
      </form>
      {error ? <p className="mt-2 text-[12px] text-red">{error}</p> : null}
    </section>
  );
}

export function InstructorLearners() {
  const { state } = useStore();
  const instructor = sessionUser(state, "instructor");
  const [query, setQuery] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  if (!instructor) return null;
  const courses = state.courses.filter((course) => course.instructorId === instructor.id);
  const people = peopleForInstructor(state, instructor.id).filter((person) => {
    if (!`${person.name} ${person.email}`.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (courseId === "all") return true;
    return state.enrollments.some((item) => item.learnerId === person.id && item.courseId === courseId);
  });
  const focus = people.find((person) => person.id === selected) ?? null;
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Learners" title="Roster" description="People enrolled on courses you teach." />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="field" placeholder="Search learners" aria-label="Search learners" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          <option value="all">All your courses</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
      </div>
      {people.length === 0 ? <EmptyState title="No learners" body="No one on this course matches the search." /> : null}
      <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-card">
        {people.map((person) => (
          <li key={person.id}>
            <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-elevated" onClick={() => setSelected(person.id)}>
              <PersonRow person={person} />
              <span className="text-[12px] text-muted">{person.engagement ? engagementLabel[person.engagement] : ""}</span>
            </button>
          </li>
        ))}
      </ul>
      <Drawer open={Boolean(focus)} title={focus?.name ?? "Learner"} onClose={() => setSelected(null)}>
        {focus ? (
          <div className="space-y-3">
            <p className="text-[13px] text-muted">{focus.bio}</p>
            {state.enrollments.filter((item) => item.learnerId === focus.id && courses.some((course) => course.id === item.courseId)).map((enrollment) => {
              const course = state.courses.find((item) => item.id === enrollment.courseId);
              if (!course) return null;
              const done = enrollment.completedLessonIds.length;
              const total = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
              return <p key={enrollment.id} className="text-[13px]">{course.title} · {done}/{total} lessons</p>;
            })}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function ReviewQueue() {
  const params = useSearchParams();
  const { state } = useStore();
  const instructor = state.role === "instructor" ? sessionUser(state, "instructor") : null;
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const rows = submissionsFor(state, instructor?.id).filter((item) => status === "all" || item.status === status);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Reviews" title="Queue" description={instructor ? "Submissions on your courses." : "Every submission in the demo."} />
      <select className="field max-w-xs" aria-label="Review status" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="all">Pending and reviewed</option>
        <option value="pending">Pending</option>
        <option value="reviewed">Reviewed</option>
      </select>
      {rows.length === 0 ? <EmptyState title="Queue is clear" body="Nothing matches this filter." /> : null}
      <ul className="space-y-3">
        {rows.map((submission) => {
          const learner = userById(state, submission.learnerId);
          const course = state.courses.find((item) => item.id === submission.courseId);
          return (
            <li key={submission.id}>
              <Link href={`${state.role === "admin" ? "/admin/reviews" : "/teach/reviews"}/${submission.id}`} className="block rounded-[14px] border border-line bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[14px] font-medium">{submission.title}</p>
                    <p className="text-[12px] text-muted">{learner?.name} · {course?.title} · {formatWhen(submission.submittedAt)}</p>
                  </div>
                  <Pill tone={submission.status === "pending" ? "orange" : "green"}>{submission.status}{submission.score !== undefined ? ` · ${submission.score}` : ""}</Pill>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ReviewDetail() {
  const params = useParams<{ id: string }>();
  const { state, reviewSubmission } = useStore();
  const submission = state.submissions.find((item) => item.id === params.id);
  const [score, setScore] = useState(submission?.score ?? 80);
  const [feedback, setFeedback] = useState(submission?.feedback ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  if (!submission) return <EmptyState title="Submission missing" body="It is not in the demo queue." />;
  const learner = userById(state, submission.learnerId);
  const course = state.courses.find((item) => item.id === submission.courseId);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="rounded-[14px] border border-line bg-card p-5">
        <p className="text-[12px] text-muted">{course?.title}</p>
        <h1 className="mt-1 text-[26px] font-semibold">{submission.title}</h1>
        <p className="mt-2 text-[13px] text-muted">{learner?.name} · submitted {formatWhen(submission.submittedAt)}</p>
        <p className="mt-4 text-[15px] leading-7">{submission.body}</p>
      </article>
      <form className="h-fit rounded-[14px] border border-line bg-card p-4" onSubmit={(event) => {
        event.preventDefault();
        if (feedback.trim().length < 8) return setError("Write a short note the learner can use.");
        if (score < 0 || score > 100) return setError("Score must be between 0 and 100.");
        setError("");
        setSaving(true);
        window.setTimeout(() => {
          reviewSubmission(submission.id, score, feedback);
          setSaving(false);
        }, 400);
      }}>
        <h2 className="text-[16px] font-semibold">Score and feedback</h2>
        <label className="mt-3 block text-[13px] font-medium">Score
          <input className="field mt-1" type="number" min={0} max={100} value={score} onChange={(event) => setScore(Number(event.target.value))} />
        </label>
        <label className="mt-3 block text-[13px] font-medium">Feedback
          <textarea className="field mt-1 min-h-28" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
        </label>
        {error ? <p className="mt-2 text-[12px] text-red">{error}</p> : null}
        <Button className="mt-3 w-full" type="submit" disabled={saving}>{saving ? "Saving…" : submission.status === "reviewed" ? "Update feedback" : "Save feedback"}</Button>
        {submission.status === "reviewed" ? <p className="mt-2 text-[12px] text-muted">Saved locally. Not sent anywhere.</p> : null}
      </form>
    </div>
  );
}

export function AnalyticsPage() {
  const { state } = useStore();
  const instructor = sessionUser(state, "instructor");
  const mine = state.enrollments.filter((item) => state.courses.find((course) => course.id === item.courseId)?.instructorId === instructor?.id);
  const completion = orgCompletion(state, mine);
  const rows = attentionCourses({ ...state, enrollments: mine }).filter((row) => row.course.instructorId === instructor?.id);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Analytics" title="Your courses" description={`${completion.completed} of ${completion.total} enrollments on your published courses are complete.`} />
      <Panel title="Enrollments and completions">
        <TrendChart data={monthlyTrend(mine)} />
      </Panel>
      <ul className="grid gap-3">
        {rows.map((row) => (
          <li key={row.course.id} className="rounded-[14px] border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[15px] font-semibold">{row.course.title}</h2>
              <span className="text-[13px] tabular-nums">{formatRate(row.completed, row.enrolled)}</span>
            </div>
            <p className="mt-1 text-[12px] text-muted">{row.completed} completed · {row.started} in progress · {row.notStarted} not started</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ReportsPage() {
  const { state } = useStore();
  const [category, setCategory] = useState("all");
  const [range, setRange] = useState<"all" | "30d" | "november">("all");
  const enrollments = filteredEnrollments(state, { category: category === "all" ? undefined : category, range });
  const completion = orgCompletion(state, enrollments);
  const rows = useMemo(() => courseRows({ ...state, enrollments }).filter((row) => category === "all" || row.course.category === category), [category, enrollments, state]);
  const reviews = state.submissions;
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Reports" title="Enrollment and completion" description="Same definition as the overview: a completion is an enrollment with every lesson done." />
      <div className="grid gap-3 md:grid-cols-2">
        <select className="field" aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {state.categories.map((item) => <option key={item.id}>{item.name}</option>)}
        </select>
        <select className="field" aria-label="Range" value={range} onChange={(event) => setRange(event.target.value as "all" | "30d" | "november")}>
          <option value="all">June–November</option>
          <option value="30d">Since 20 October</option>
          <option value="november">November enrollments</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-[14px] border border-line bg-card p-4"><p className="text-[12px] text-muted">Enrollments</p><p className="text-[24px] font-semibold">{completion.total}</p></div>
        <div className="rounded-[14px] border border-line bg-card p-4"><p className="text-[12px] text-muted">Completed</p><p className="text-[24px] font-semibold">{completion.completed}</p></div>
        <div className="rounded-[14px] border border-line bg-card p-4"><p className="text-[12px] text-muted">Completion rate</p><p className="text-[24px] font-semibold">{formatRate(completion.completed, completion.total)}</p></div>
      </div>
      <Panel title="Trend for this filter">
        <div id="revenue" className="sr-only">Revenue figures on the overview are demo data and are not repeated as collected payments here.</div>
        <TrendChart data={monthlyTrend(enrollments)} />
      </Panel>
      <div className="overflow-x-auto rounded-[14px] border border-line">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">Course</th><th className="px-3 py-2 font-medium">Enrolled</th><th className="px-3 py-2 font-medium">In progress</th><th className="px-3 py-2 font-medium">Not started</th><th className="px-3 py-2 font-medium">Completed</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.course.id} className="border-t border-line">
                <td className="px-3 py-3">{row.course.title}</td>
                <td className="px-3 py-3 tabular-nums">{row.enrolled}</td>
                <td className="px-3 py-3 tabular-nums">{row.started}</td>
                <td className="px-3 py-3 tabular-nums">{row.notStarted}</td>
                <td className="px-3 py-3 tabular-nums">{row.completed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section id="reviews" className="space-y-3">
        <h2 className="text-[16px] font-semibold">Reviews</h2>
        <p className="text-[13px] text-muted">{reviews.filter((item) => item.status === "pending").length} pending · {reviews.filter((item) => item.status === "reviewed").length} reviewed. The 31 Oct snapshot had {state.reviewSnapshot.pending} pending.</p>
        <ul className="space-y-2">
          {reviews.map((submission) => (
            <li key={submission.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line px-3 py-2 text-[13px]">
              <span>{submission.title} · {userById(state, submission.learnerId)?.name}</span>
              <Link href={`/admin/reviews/${submission.id}`} className="text-blue">{submission.status === "pending" ? "Grade" : `Reviewed ${submission.score}`}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function AnnouncementsPage() {
  const { state, addAnnouncement } = useStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("everyone");
  const [error, setError] = useState("");
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-3">
        <PageHeader eyebrow="Announcements" title="Notes" description="Posted into the demo only. Nobody is emailed." />
        {state.announcements.map((item) => (
          <article key={item.id} className="rounded-[14px] border border-line bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[16px] font-semibold">{item.title}</h2>
              <Pill>{item.audience}</Pill>
            </div>
            <p className="mt-2 text-[14px] leading-6">{item.body}</p>
            <p className="mt-2 text-[12px] text-muted">{userById(state, item.authorId)?.name} · {formatDate(item.createdAt)}</p>
          </article>
        ))}
      </div>
      <form className="h-fit rounded-[14px] border border-line bg-card p-4" onSubmit={(event) => {
        event.preventDefault();
        if (title.trim().length < 4 || body.trim().length < 12) return setError("Add a title and a short note.");
        addAnnouncement({ title, body, audience });
        setTitle("");
        setBody("");
        setError("");
      }}>
        <h2 className="text-[16px] font-semibold">Compose</h2>
        <label className="mt-3 block text-[13px] font-medium">Title<input className="field mt-1" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="mt-3 block text-[13px] font-medium">Note<textarea className="field mt-1 min-h-28" value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <label className="mt-3 block text-[13px] font-medium">Audience
          <select className="field mt-1" value={audience} onChange={(event) => setAudience(event.target.value as Audience)}>
            <option value="everyone">Everyone</option>
            <option value="learners">Learners</option>
            <option value="instructors">Instructors</option>
          </select>
        </label>
        {error ? <p className="mt-2 text-[12px] text-red">{error}</p> : null}
        <Button className="mt-3 w-full" type="submit">Post to demo</Button>
      </form>
    </div>
  );
}

export function SettingsPage() {
  const { state, saveSettings, resetDemo } = useStore();
  const [form, setForm] = useState(state.settings);
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader eyebrow="Settings" title="Organization" description="Preferences for this browser. Authentication is local until Supabase is connected." />
      <form className="space-y-3 rounded-[14px] border border-line bg-card p-4" onSubmit={(event) => { event.preventDefault(); saveSettings(form); }}>
        <label className="block text-[13px] font-medium">Organization name<input className="field mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label className="block text-[13px] font-medium">Short name<input className="field mt-1" value={form.shortName} onChange={(event) => setForm({ ...form, shortName: event.target.value })} /></label>
        <label className="block text-[13px] font-medium">Timezone
          <select className="field mt-1" value={form.timezone} onChange={(event) => setForm({ ...form, timezone: event.target.value })}>
            <option value="UTC">UTC</option>
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="America/New_York">America/New_York</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </label>
        <label className="block text-[13px] font-medium">Week starts
          <select className="field mt-1" value={form.weekStartsOn} onChange={(event) => setForm({ ...form, weekStartsOn: event.target.value as "mon" | "sun" })}>
            <option value="mon">Monday</option>
            <option value="sun">Sunday</option>
          </select>
        </label>
        <label className="block text-[13px] font-medium">Support note<textarea className="field mt-1 min-h-20" value={form.supportNote} onChange={(event) => setForm({ ...form, supportNote: event.target.value })} /></label>
        <Button type="submit">Save settings</Button>
      </form>
      <section className="rounded-[14px] border border-line p-4 text-[13px] leading-6 text-muted">
        <h2 className="text-[16px] font-semibold text-ink">Later phase</h2>
        <p className="mt-2">Accounts, courses and progress stay in this browser. Passwords are hashed here and are not production credentials. Supabase Auth, Postgres, Storage and row level security are not connected.</p>
        <Button className="mt-3" variant="danger" onClick={() => setConfirm(true)}>Clear learning records</Button>
      </section>
      {confirm ? (
        <div className="flex gap-2">
          <Button variant="danger" onClick={() => { resetDemo(); setConfirm(false); }}>Confirm reset</Button>
          <Button variant="secondary" onClick={() => setConfirm(false)}>Cancel</Button>
        </div>
      ) : null}
    </div>
  );
}

export function ProfilePage() {
  const { state, saveUser } = useStore();
  const person = sessionUser(state);
  const [name, setName] = useState(person?.name ?? "");
  const [title, setTitle] = useState(person?.title ?? "");
  const [bio, setBio] = useState(person?.bio ?? "");
  if (!person) return null;
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <PageHeader eyebrow="Profile" title={person.name} description={`${person.email} · ${person.role}. Saved on this browser.`} />
      <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); saveUser({ ...person, name, title, bio }); }}>
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-full bg-[#D8C8B8] text-[16px] font-semibold text-[#29231F]">
            {person.avatar ? <img src={person.avatar} alt="" className="h-full w-full object-cover" /> : person.name.slice(0, 1)}
          </span>
          <label className="text-[13px] font-medium">Profile image
            <input className="field mt-1" type="file" accept="image/*" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file || file.size > 350_000) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") saveUser({ ...person, avatar: reader.result });
              };
              reader.readAsDataURL(file);
            }} />
          </label>
        </div>
        <label className="block text-[13px] font-medium">Name<input className="field mt-1" value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label className="block text-[13px] font-medium">Title<input className="field mt-1" value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label className="block text-[13px] font-medium">Bio<textarea className="field mt-1 min-h-28" value={bio} onChange={(event) => setBio(event.target.value)} /></label>
        <p className="text-[12px] text-muted">{person.email}</p>
        <Button type="submit">Save profile</Button>
      </form>
    </div>
  );
}

export function CalendarRoute() {
  const { state, addEvent } = useStore();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow={state.settings.name} title="Calendar" description={`Week starts on ${state.settings.weekStartsOn === "mon" ? "Monday" : "Sunday"}. Dates added here stay in this browser.`} />
      <CalendarPanel events={state.events} weekStartsOn={state.settings.weekStartsOn} onCreate={addEvent} />
    </div>
  );
}

