"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { enrollmentView, userById } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { CategoryStatus, TicketStatus } from "@/lib/types";
import { UserDialog } from "../user-dialog";
import { Button, ConfirmDialog, Drawer, EmptyState, PageHeader, Pill, ProgressBar } from "../ui";
import { PersonRow } from "../widgets";

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between text-[13px]">
      <p className="text-muted">Page {page} of {pages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page === 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="secondary" disabled={page === pages} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

export function UsersAdmin() {
  const { state, removeUser, setUserStatus } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"name" | "activity">("name");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const rows = useMemo(() => state.users
    .filter((user) => user.role === "learner")
    .filter((user) => status === "all" || user.status === status)
    .filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "activity" ? b.lastActive.localeCompare(a.lastActive) : a.name.localeCompare(b.name)), [query, sort, state.users, status]);
  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);
  const selected = state.users.find((user) => user.id === editing);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="People" title="Students" description="Manage student accounts." actions={<Button onClick={() => setEditing("new")}>Add student</Button>} />
      <div className="grid gap-3 md:grid-cols-3">
        <input className="field" aria-label="Search students" placeholder="Search name or email" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
        <select className="field" aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
        </select>
        <select className="field" aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value as "name" | "activity")}>
          <option value="name">Sort by name</option>
          <option value="activity">Sort by last active</option>
        </select>
      </div>
      {error ? <p className="text-[13px] text-red">{error}</p> : null}
      {rows.length === 0 ? <EmptyState title="No students yet" body="Students will appear when they register or enroll." action={<Button onClick={() => setEditing("new")}>Add student</Button>} /> : (
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">Student</th><th className="px-3 py-2 font-medium">Role</th><th className="px-3 py-2 font-medium">Last active</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Actions</th></tr></thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-t border-line">
                  <td className="px-3 py-3"><PersonRow person={user} /></td>
                  <td className="px-3 py-3 capitalize">{user.role}</td>
                  <td className="px-3 py-3">{user.lastActive}</td>
                  <td className="px-3 py-3 capitalize">{user.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-3">
                      <button type="button" className="text-blue" onClick={() => setEditing(user.id)}>Edit</button>
                      <button type="button" className="text-blue" onClick={() => setUserStatus(user.id, user.status === "active" ? "suspended" : "active")}>{user.status === "active" ? "Deactivate" : "Activate"}</button>
                      <button type="button" className="text-red" onClick={() => { setError(""); setRemoving(user.id); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager page={Math.min(page, pages)} pages={pages} onPage={setPage} />
      <UserDialog open={editing !== null} initial={editing && editing !== "new" ? selected : null} defaultRole="learner" onClose={() => setEditing(null)} />
      <ConfirmDialog open={removing !== null} title="Remove this student?" body="Their demo enrollments and submissions in this browser are removed with them. The three signed-in demo personas cannot be deleted." confirmLabel="Delete" tone="danger" onClose={() => setRemoving(null)} onConfirm={() => { if (removing) setError(removeUser(removing) ?? ""); setRemoving(null); }} />
    </div>
  );
}

export function InstructorsAdmin() {
  const { state, setUserStatus } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const rows = state.users.filter((user) => user.role === "instructor" && (status === "all" || user.status === status) && `${user.name} ${user.email}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = state.users.find((user) => user.id === (viewing ?? editing));
  const courses = selected ? state.courses.filter((course) => course.instructorId === selected.id) : [];
  const learners = new Set(state.enrollments.filter((item) => courses.some((course) => course.id === item.courseId)).map((item) => item.learnerId)).size;

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="People" title="Instructors" description="Approve instructor accounts and see the courses they teach." actions={<Button onClick={() => setEditing("new")}>Add instructor</Button>} />
      <div className="grid gap-3 md:grid-cols-2">
        <input className="field" aria-label="Search instructors" placeholder="Search name or email" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Pending approval</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      {rows.length === 0 ? <EmptyState title="No instructors match" body="Add an instructor or clear the filter." /> : (
        <ul className="divide-y divide-line rounded-[14px] border border-line">
          {rows.map((user) => {
            const taught = state.courses.filter((course) => course.instructorId === user.id);
            const enrolled = new Set(state.enrollments.filter((item) => taught.some((course) => course.id === item.courseId)).map((item) => item.learnerId)).size;
            return (
              <li key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <PersonRow person={user} />
                <p className="text-[13px] text-muted">{taught.length} courses · {enrolled} students · {user.status === "invited" ? "pending approval" : user.status}</p>
                <div className="flex gap-3 text-[13px]">
                  <button type="button" className="text-blue" onClick={() => setViewing(user.id)}>View</button>
                  <button type="button" className="text-blue" onClick={() => setEditing(user.id)}>Edit</button>
                  <button type="button" className="text-blue" onClick={() => setUserStatus(user.id, user.status === "active" ? "suspended" : "active")}>{user.status === "active" ? "Deactivate" : "Activate"}</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <UserDialog open={editing !== null} initial={editing && editing !== "new" ? state.users.find((user) => user.id === editing) : null} defaultRole="instructor" onClose={() => setEditing(null)} />
      <Drawer open={viewing !== null} title={selected?.name ?? "Instructor"} onClose={() => setViewing(null)}>
        {selected ? (
          <div className="space-y-3 text-[14px]">
            <p className="text-muted">{selected.email}</p>
            <p>{selected.bio}</p>
            <p>{courses.length} assigned courses · {learners} students</p>
            <ul className="space-y-2">
              {courses.map((course) => <li key={course.id}><Link className="text-blue" href={`/admin/courses/${course.id}`}>{course.title}</Link> <span className="text-muted">· {course.status}</span></li>)}
            </ul>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function CategoriesAdmin() {
  const { state, addCategory, saveCategory, removeCategory } = useStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftStatus, setDraftStatus] = useState<CategoryStatus>("active");
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="Categories" description="Categories label courses in this browser. Deleting one is blocked while a course still uses it." />
      <form className="grid gap-3 rounded-[14px] border border-line bg-card p-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={(event) => { event.preventDefault(); const message = addCategory(name, description); setError(message ?? ""); if (!message) { setName(""); setDescription(""); } }}>
        <input className="field" aria-label="Category name" placeholder="Category name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="field" aria-label="Category description" placeholder="Description" value={description} onChange={(event) => setDescription(event.target.value)} />
        <Button type="submit">Add category</Button>
      </form>
      {error ? <p className="text-[13px] text-red">{error}</p> : null}
      <ul className="divide-y divide-line rounded-[14px] border border-line">
        {state.categories.map((category) => {
          const count = state.courses.filter((course) => course.category === category.name).length;
          const open = editing === category.id;
          return (
            <li key={category.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{category.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{category.description || "No description"}</p>
                  <p className="mt-1 text-[12px] text-muted">{count} courses · {category.status ?? "active"}</p>
                </div>
                <div className="flex gap-3 text-[13px]">
                  <button type="button" className="text-blue" onClick={() => { setEditing(category.id); setDraftName(category.name); setDraftDescription(category.description); setDraftStatus(category.status ?? "active"); }}>Edit</button>
                  <button type="button" className="text-red" onClick={() => setRemoving(category.id)}>Delete</button>
                </div>
              </div>
              {open ? (
                <form className="mt-3 grid gap-2" onSubmit={(event) => { event.preventDefault(); setError(saveCategory(category.id, draftName, draftDescription, draftStatus) ?? ""); setEditing(null); }}>
                  <input className="field" aria-label="Edit name" value={draftName} onChange={(event) => setDraftName(event.target.value)} />
                  <input className="field" aria-label="Edit description" value={draftDescription} onChange={(event) => setDraftDescription(event.target.value)} />
                  <select className="field" aria-label="Category status" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value as CategoryStatus)}>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                  <Button type="submit">Save category</Button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
      <ConfirmDialog open={removing !== null} title="Delete this category?" body="This only works when no course still uses the name." confirmLabel="Delete" tone="danger" onClose={() => setRemoving(null)} onConfirm={() => { if (removing) setError(removeCategory(removing) ?? ""); setRemoving(null); }} />
    </div>
  );
}

export function EnrollmentsAdmin() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"date" | "name">("date");
  const rows = state.enrollments.map((enrollment) => {
    const learner = userById(state, enrollment.learnerId);
    const course = state.courses.find((item) => item.id === enrollment.courseId);
    const instructor = course ? userById(state, course.instructorId) : undefined;
    const view = course ? enrollmentView(course, enrollment) : null;
    return { enrollment, learner, course, instructor, view };
  }).filter((row) => row.learner && row.course && row.view)
    .filter((row) => status === "all" || row.view?.status === status)
    .filter((row) => `${row.learner?.name} ${row.course?.title}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => sort === "name" ? (a.learner?.name ?? "").localeCompare(b.learner?.name ?? "") : b.enrollment.enrolledAt.localeCompare(a.enrollment.enrolledAt));

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="Enrollments" description="Every enrollment stored in this browser, with progress from completed lessons." />
      <div className="grid gap-3 md:grid-cols-3">
        <input className="field" aria-label="Search enrollments" placeholder="Student or course" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Progress status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All progress</option>
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="field" aria-label="Sort enrollments" value={sort} onChange={(event) => setSort(event.target.value as "date" | "name")}>
          <option value="date">Newest enrollment</option>
          <option value="name">Student name</option>
        </select>
      </div>
      {rows.length === 0 ? <EmptyState title="No enrollments" body="Nothing matches those filters." /> : (
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">Student</th><th className="px-3 py-2 font-medium">Course</th><th className="px-3 py-2 font-medium">Instructor</th><th className="px-3 py-2 font-medium">Enrolled</th><th className="px-3 py-2 font-medium">Progress</th><th className="px-3 py-2 font-medium">Status</th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.enrollment.id} className="border-t border-line">
                  <td className="px-3 py-3">{row.learner?.name}<span className="block text-[12px] text-muted">{row.learner?.email}</span></td>
                  <td className="px-3 py-3">{row.course?.title}</td>
                  <td className="px-3 py-3">{row.instructor?.name}</td>
                  <td className="px-3 py-3">{row.enrollment.enrolledAt}</td>
                  <td className="px-3 py-3 w-36"><ProgressBar value={row.view?.progress ?? 0} label="Enrollment progress" /></td>
                  <td className="px-3 py-3 capitalize">{row.view?.status.replaceAll("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AssessmentsAdmin() {
  const { state, saveQuiz, removeQuiz } = useStore();
  const [courseId, setCourseId] = useState(state.courses[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Learning" title="Assessments and quizzes" description="Quizzes already attached to lessons. A new assessment needs a lesson that does not have one yet." />
      <form className="grid gap-3 rounded-[14px] border border-line bg-card p-4 md:grid-cols-4" onSubmit={(event) => { event.preventDefault(); setError(saveQuiz({ courseId, title, minutes: Number(minutes) }) ?? ""); if (!error) setTitle(""); }}>
        <select className="field" aria-label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}>
          {state.courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        <input className="field" aria-label="Assessment title" placeholder="Assessment title" value={title} onChange={(event) => setTitle(event.target.value)} />
        <input className="field" aria-label="Duration in minutes" type="number" min={5} max={180} value={minutes} onChange={(event) => setMinutes(event.target.value)} />
        <Button type="submit">Create assessment</Button>
      </form>
      {error ? <p className="text-[13px] text-red">{error}</p> : null}
      <div className="overflow-x-auto rounded-[14px] border border-line">
        <table className="w-full min-w-[860px] text-left text-[13px]">
          <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">Assessment</th><th className="px-3 py-2 font-medium">Course</th><th className="px-3 py-2 font-medium">Questions</th><th className="px-3 py-2 font-medium">Marks</th><th className="px-3 py-2 font-medium">Pass</th><th className="px-3 py-2 font-medium">Duration</th><th className="px-3 py-2 font-medium">Attempts</th><th className="px-3 py-2 font-medium">Status</th><th className="px-3 py-2 font-medium">Actions</th></tr></thead>
          <tbody>
            {state.quizzes.map((quiz) => {
              const course = state.courses.find((item) => item.id === quiz.courseId);
              const attempts = state.attempts.filter((item) => item.quizId === quiz.id).length;
              return (
                <tr key={quiz.id} className="border-t border-line">
                  <td className="px-3 py-3">{editing === quiz.id ? <input className="field" aria-label="Edit title" value={title} onChange={(event) => setTitle(event.target.value)} /> : quiz.title}</td>
                  <td className="px-3 py-3">{course?.title}</td>
                  <td className="px-3 py-3">{quiz.questions.length}</td>
                  <td className="px-3 py-3">{quiz.questions.length}</td>
                  <td className="px-3 py-3">70%</td>
                  <td className="px-3 py-3">{quiz.minutes} min</td>
                  <td className="px-3 py-3">{attempts}</td>
                  <td className="px-3 py-3 capitalize">{course?.status}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-3">
                      {editing === quiz.id ? <button type="button" className="text-blue" onClick={() => { setError(saveQuiz({ id: quiz.id, courseId: quiz.courseId, title, minutes: quiz.minutes }) ?? ""); setEditing(null); }}>Save</button> : <button type="button" className="text-blue" onClick={() => { setEditing(quiz.id); setTitle(quiz.title); }}>Edit</button>}
                      <button type="button" className="text-red" onClick={() => setRemoving(quiz.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={removing !== null} title="Delete this assessment?" body="Assessments with recorded attempts stay in the demo." confirmLabel="Delete" tone="danger" onClose={() => setRemoving(null)} onConfirm={() => { if (removing) setError(removeQuiz(removing) ?? ""); setRemoving(null); }} />
    </div>
  );
}

export function AssignmentsAdmin() {
  const { state } = useStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = state.courses.filter((course) => course.assignment);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Learning" title="Assignments" description="Each published course can carry one assignment. Submissions and scores already live in the review queue." />
      <ul className="space-y-3">
        {rows.map((course) => {
          const submissions = state.submissions.filter((item) => item.courseId === course.id);
          const pending = submissions.filter((item) => item.status === "pending").length;
          const instructor = userById(state, course.instructorId);
          return (
            <li key={course.id} className="rounded-[14px] border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold">{course.assignment?.title}</h2>
                  <p className="mt-1 text-[13px] text-muted">{course.title} · {instructor?.name} · due {course.assignment?.due}</p>
                </div>
                <Pill tone={pending ? "orange" : "teal"}>{pending ? `${pending} pending` : "Reviewed"}</Pill>
              </div>
              <p className="mt-3 text-[13px] text-muted">{submissions.length} submissions · {pending} waiting for evaluation</p>
              <button type="button" className="mt-3 text-[13px] text-blue" onClick={() => setOpenId(openId === course.id ? null : course.id)}>{openId === course.id ? "Hide submissions" : "View submissions"}</button>
              {openId === course.id ? (
                <ul className="mt-3 divide-y divide-line border-t border-line">
                  {submissions.length === 0 ? <li className="py-3 text-[13px] text-muted">No submissions yet.</li> : submissions.map((submission) => (
                    <li key={submission.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-[13px]">
                      <span>{userById(state, submission.learnerId)?.name}<span className="block text-muted">{submission.submittedAt.slice(0, 10)}</span></span>
                      <span className="capitalize">{submission.status}{submission.score !== undefined ? ` · ${submission.score}` : ""}</span>
                      <Link className="text-blue" href={`/admin/reviews/${submission.id}`}>Open review</Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CertificatesAdmin() {
  const { state } = useStore();
  const [preview, setPreview] = useState<string | null>(null);
  const rows = state.enrollments.filter((item) => item.completedAt).map((enrollment) => ({
    enrollment,
    learner: userById(state, enrollment.learnerId),
    course: state.courses.find((item) => item.id === enrollment.courseId),
  })).filter((row) => row.learner && row.course);
  const current = rows.find((row) => row.enrollment.id === preview);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Learning" title="Certificates" description="Issued when every lesson in an enrollment is complete. These are demo previews, not verifiable credentials." />
      {rows.length === 0 ? <EmptyState title="No certificates yet" body="A certificate appears here after a learner finishes every lesson in a course." /> : (
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">Student</th><th className="px-3 py-2 font-medium">Course</th><th className="px-3 py-2 font-medium">Issued</th><th className="px-3 py-2 font-medium">Certificate ID</th><th className="px-3 py-2 font-medium">Verification</th><th className="px-3 py-2 font-medium"></th></tr></thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.enrollment.id} className="border-t border-line">
                  <td className="px-3 py-3">{row.learner?.name}</td>
                  <td className="px-3 py-3">{row.course?.title}</td>
                  <td className="px-3 py-3">{row.enrollment.completedAt}</td>
                  <td className="px-3 py-3">{row.enrollment.id}</td>
                  <td className="px-3 py-3">Demo record only</td>
                  <td className="px-3 py-3 text-right"><button type="button" className="text-blue" onClick={() => setPreview(row.enrollment.id)}>Preview</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Drawer open={current !== undefined} title="Certificate preview" onClose={() => setPreview(null)}>
        {current ? (
          <div className="rounded-[14px] border border-line px-6 py-8 text-center">
            <p className="text-[12px] font-medium text-orange">Demo certificate — not a verified credential</p>
            <p className="mt-4 text-[13px] text-muted">Smart LMS</p>
            <p className="mt-2 text-[22px] font-semibold">{current.learner?.name}</p>
            <p className="mt-2 text-[14px]">has finished the lessons in</p>
            <p className="mt-1 text-[18px] font-semibold">{current.course?.title}</p>
            <p className="mt-4 text-[12px] text-muted">ID {current.enrollment.id} · {current.enrollment.completedAt}</p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

export function NotificationsAdmin() {
  const { state, markNotification, markAllNotifications } = useStore();
  const notes = state.notifications.filter((item) => item.roles.includes("admin"));
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Messages" title="Notifications" description="Notices already stored for the admin role. Marking one read updates this browser only." actions={<Button variant="secondary" onClick={markAllNotifications}>Mark all read</Button>} />
      {notes.length === 0 ? <EmptyState title="No notifications" body="Announcements you post will appear here." /> : (
        <ul className="divide-y divide-line rounded-[14px] border border-line">
          {notes.map((note) => (
            <li key={note.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{note.title}{note.read ? "" : " · unread"}</p>
                <p className="mt-1 text-[13px] text-muted">{note.body}</p>
                <p className="mt-1 text-[12px] text-muted">{note.createdAt.slice(0, 10)}</p>
              </div>
              <button type="button" className="text-[13px] text-blue" onClick={() => markNotification(note.id, !note.read)}>{note.read ? "Mark unread" : "Mark read"}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SupportAdmin() {
  const { state, setTicketStatus } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = state.tickets
    .filter((ticket) => status === "all" || ticket.status === status)
    .filter((ticket) => priority === "all" || ticket.priority === priority)
    .filter((ticket) => `${ticket.name} ${ticket.email} ${ticket.subject}`.toLowerCase().includes(query.trim().toLowerCase()));
  const current = state.tickets.find((ticket) => ticket.id === openId);

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Messages" title="Support and feedback" description="Sample queries stored in this browser. Changing a status does not email the person." />
      <div className="grid gap-3 md:grid-cols-3">
        <input className="field" aria-label="Search support" placeholder="Name, email or subject" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select className="field" aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="closed">Closed</option>
        </select>
        <select className="field" aria-label="Priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
          <option value="all">All priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>
      {rows.length === 0 ? <EmptyState title="No queries" body="Nothing matches those filters." /> : (
        <div className="overflow-x-auto rounded-[14px] border border-line">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-elevated text-muted"><tr><th className="px-3 py-2 font-medium">From</th><th className="px-3 py-2 font-medium">Subject</th><th className="px-3 py-2 font-medium">Submitted</th><th className="px-3 py-2 font-medium">Priority</th><th className="px-3 py-2 font-medium">Status</th></tr></thead>
            <tbody>
              {rows.map((ticket) => (
                <tr key={ticket.id} className="border-t border-line">
                  <td className="px-3 py-3">{ticket.name}<span className="block text-[12px] text-muted">{ticket.email}</span></td>
                  <td className="px-3 py-3"><button type="button" className="text-left text-blue" onClick={() => setOpenId(ticket.id)}>{ticket.subject}</button></td>
                  <td className="px-3 py-3">{ticket.createdAt.slice(0, 10)}</td>
                  <td className="px-3 py-3 capitalize">{ticket.priority}</td>
                  <td className="px-3 py-3">
                    <select className="field" aria-label={`Status for ${ticket.subject}`} value={ticket.status} onChange={(event) => setTicketStatus(ticket.id, event.target.value as TicketStatus)}>
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Drawer open={current !== undefined} title={current?.subject ?? "Query"} onClose={() => setOpenId(null)}>
        {current ? <div className="space-y-2 text-[14px] leading-6"><p>{current.name} · {current.email}</p><p>{current.message}</p><p className="text-[12px] text-muted">Course length context is separate. Sample course time on record is not attached to this query.</p></div> : null}
      </Drawer>
    </div>
  );
}
