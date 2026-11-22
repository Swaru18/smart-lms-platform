"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { formatWhen, newId } from "@/lib/format";
import { courseById, sessionUser, userById } from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { CourseLevel, LessonType } from "@/lib/types";
import { Button, ConfirmDialog, EmptyState, PageHeader, Pill } from "../ui";
import { CourseArt } from "../widgets";

export function NewCourse({ base }: { base: "/admin/courses" | "/teach/courses" }) {
  const { createCourse } = useStore();
  const router = useRouter();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Draft" title="Start a course" description="Creates a draft in this browser. Publishing needs a title, a summary and at least one lesson." />
      <Button onClick={() => router.push(`${base}/${createCourse()}`)}>Create draft</Button>
    </div>
  );
}

export function CourseBuilder({ base }: { base: "/admin/courses" | "/teach/courses" }) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, updateCourse, publishCourse, unpublishCourse, discardDraft } = useStore();
  const course = courseById(state, params.id);
  const [tab, setTab] = useState<"details" | "curriculum" | "assessments" | "preview">("details");
  const [message, setMessage] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const actor = sessionUser(state);
  if (!course) return <EmptyState title="Course not found" body="It may have been discarded from this browser." action={<Link href={base} className="text-blue">Back to courses</Link>} />;
  const canEdit = state.role === "admin" || course.instructorId === actor?.id;
  const tabs = ["details", "curriculum", "assessments", "preview"] as const;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={course.status === "draft" ? "Draft · saved in this browser" : "Published"}
        title={course.title}
        description={canEdit ? "Details, thumbnail, curriculum, then preview." : `View only. Assigned to ${userById(state, course.instructorId)?.name ?? "an instructor"}.`}
        actions={canEdit ? (
          <>
            {course.status === "draft" ? <Button variant="danger" onClick={() => setConfirmDiscard(true)}>Discard draft</Button> : <Button variant="secondary" onClick={() => unpublishCourse(course.id)}>Unpublish</Button>}
            {state.role === "admin" ? (
              <Button onClick={() => setMessage(publishCourse(course.id) ?? "")}>{course.status === "published" ? "Publish updates" : "Publish"}</Button>
            ) : course.status === "in_review" ? (
              <Button disabled>Waiting for approval</Button>
            ) : (
              <Button onClick={() => setMessage(publishCourse(course.id) ?? "")}>Submit for approval</Button>
            )}
          </>
        ) : null}
      />
      {message ? <p className="text-[13px] text-red" role="alert">{message}</p> : null}
      <div className="flex gap-1 overflow-x-auto rounded-[12px] border border-line bg-card p-1">
        {tabs.map((item) => (
          <button key={item} type="button" className={`h-9 rounded-[8px] px-3 text-[13px] capitalize ${tab === item ? "bg-elevated font-medium" : "text-muted"}`} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      {tab === "details" ? <Details courseId={course.id} disabled={!canEdit} /> : null}
      {tab === "curriculum" ? <Curriculum courseId={course.id} disabled={!canEdit} /> : null}
      {tab === "assessments" ? <Assessments courseId={course.id} disabled={!canEdit} /> : null}
      {tab === "preview" ? <Preview courseId={course.id} /> : null}
      <ConfirmDialog
        open={confirmDiscard}
        title="Discard this draft?"
        body="The draft is removed from this browser. Published courses should be unpublished instead."
        confirmLabel="Discard"
        tone="danger"
        onClose={() => setConfirmDiscard(false)}
        onConfirm={() => { discardDraft(course.id); setConfirmDiscard(false); router.push(base); }}
      />
    </div>
  );
}

function Details({ courseId, disabled }: { courseId: string; disabled: boolean }) {
  const { state, updateCourse } = useStore();
  const course = courseById(state, courseId);
  if (!course) return null;
  const set = <K extends keyof typeof course>(key: K, value: (typeof course)[K]) => {
    if (disabled) return;
    updateCourse(courseId, (draft) => { draft[key] = value; });
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <label className="text-[13px] font-medium">Title
        <input className="field mt-1" disabled={disabled} value={course.title} onChange={(event) => set("title", event.target.value)} />
      </label>
      <label className="text-[13px] font-medium">Category
        <select className="field mt-1" disabled={disabled} value={course.category} onChange={(event) => set("category", event.target.value)}>
          {state.categories.map((category) => <option key={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label className="text-[13px] font-medium">Level
        <select className="field mt-1" disabled={disabled} value={course.level} onChange={(event) => set("level", event.target.value as CourseLevel)}>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </label>
      <label className="text-[13px] font-medium">Instructor
        <select className="field mt-1" disabled={disabled || state.role !== "admin"} value={course.instructorId} onChange={(event) => set("instructorId", event.target.value)}>
          {state.users.filter((user) => user.role === "instructor" || user.role === "admin" || user.id === course.instructorId).map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
        </select>
      </label>
      <label className="text-[13px] font-medium lg:col-span-2">Thumbnail URL
        <input className="field mt-1" disabled={disabled} placeholder="https:// or leave blank" value={course.cover} onChange={(event) => set("cover", event.target.value)} />
      </label>
      <label className="text-[13px] font-medium">Upload thumbnail
        <input className="field mt-1" disabled={disabled} type="file" accept="image/*" onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file || file.size > 350_000) return;
          const reader = new FileReader();
          reader.onload = () => { if (typeof reader.result === "string") set("cover", reader.result); };
          reader.readAsDataURL(file);
        }} />
      </label>
      <label className="text-[13px] font-medium lg:col-span-2">Summary
        <textarea className="field mt-1 min-h-20" disabled={disabled} value={course.summary} onChange={(event) => set("summary", event.target.value)} />
      </label>
      <label className="text-[13px] font-medium lg:col-span-2">Overview
        <textarea className="field mt-1 min-h-28" disabled={disabled} value={course.overview} onChange={(event) => set("overview", event.target.value)} />
      </label>
      <div className="lg:col-span-2">
        <p className="text-[13px] font-medium">Outcomes</p>
        <ul className="mt-2 space-y-2">
          {course.outcomes.map((outcome, index) => (
            <li key={`${outcome}-${index}`} className="flex gap-2">
              <input className="field" disabled={disabled} value={outcome} onChange={(event) => updateCourse(courseId, (draft) => { draft.outcomes[index] = event.target.value; })} />
              <Button variant="quiet" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => { draft.outcomes = draft.outcomes.filter((_, item) => item !== index); })} aria-label="Remove outcome"><Trash2 size={16} /></Button>
            </li>
          ))}
        </ul>
        <Button className="mt-2" variant="secondary" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => { draft.outcomes.push(""); })}>Add objective</Button>
      </div>
      <label className="text-[13px] font-medium">Assignment title
        <input className="field mt-1" disabled={disabled} value={course.assignment?.title ?? ""} onChange={(event) => updateCourse(courseId, (draft) => { draft.assignment = { title: event.target.value, prompt: draft.assignment?.prompt ?? "", due: draft.assignment?.due ?? "2026-12-12" }; })} />
      </label>
      <label className="text-[13px] font-medium">Assignment due
        <input className="field mt-1" disabled={disabled} type="date" value={course.assignment?.due ?? ""} onChange={(event) => updateCourse(courseId, (draft) => { draft.assignment = { title: draft.assignment?.title ?? "Assignment", prompt: draft.assignment?.prompt ?? "", due: event.target.value }; })} />
      </label>
      <label className="text-[13px] font-medium lg:col-span-2">Assignment prompt
        <textarea className="field mt-1 min-h-20" disabled={disabled} value={course.assignment?.prompt ?? ""} onChange={(event) => updateCourse(courseId, (draft) => { draft.assignment = { title: draft.assignment?.title ?? "Assignment", prompt: event.target.value, due: draft.assignment?.due ?? "2026-12-12" }; })} />
      </label>
    </div>
  );
}

function Curriculum({ courseId, disabled }: { courseId: string; disabled: boolean }) {
  const { state, updateCourse } = useStore();
  const course = courseById(state, courseId);
  const [open, setOpen] = useState<string | null>(course?.modules[0]?.id ?? null);
  if (!course) return null;
  return (
    <div className="space-y-3">
      {course.modules.map((module, moduleIndex) => (
        <section key={module.id} className="rounded-[14px] border border-line bg-card">
          <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left" aria-expanded={open === module.id} onClick={() => setOpen(open === module.id ? null : module.id)}>
            <span className="text-[15px] font-medium">{module.title}</span>
            <span className="text-[12px] text-muted">{module.lessons.length} lessons</span>
          </button>
          {open === module.id ? (
            <div className="space-y-3 border-t border-line px-4 py-3">
              <input className="field" disabled={disabled} aria-label="Module title" value={module.title} onChange={(event) => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].title = event.target.value; })} />
              <textarea className="field min-h-16" disabled={disabled} aria-label="Module summary" value={module.summary} onChange={(event) => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].summary = event.target.value; })} />
              <ul className="space-y-3">
                {module.lessons.map((lesson, lessonIndex) => (
                  <li key={lesson.id} className="rounded-[12px] border border-line p-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_140px_90px]">
                      <input className="field" disabled={disabled} aria-label="Lesson title" value={lesson.title} onChange={(event) => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].lessons[lessonIndex].title = event.target.value; })} />
                      <select className="field" disabled={disabled} aria-label="Lesson type" value={lesson.type} onChange={(event) => updateCourse(courseId, (course, draft) => {
                        const next = course.modules[moduleIndex].lessons[lessonIndex];
                        next.type = event.target.value as LessonType;
                        if (next.type === "quiz" && !next.quizId) {
                          const quizId = newId("quiz");
                          next.quizId = quizId;
                          draft.quizzes.push({
                            id: quizId,
                            courseId,
                            lessonId: next.id,
                            title: next.title || "Quiz",
                            minutes: 10,
                            questions: [
                              { id: newId("qq"), prompt: "What should a learner be able to do after this lesson?", options: ["Name the task", "Memorize the slides", "Skip the practice", "Wait for a certificate"], correctIndex: 0, feedback: "Prepared feedback: name the task they will practice." },
                            ],
                          });
                        }
                      })}>
                        <option value="text">Text</option>
                        <option value="video">Video placeholder</option>
                        <option value="resource">Resource</option>
                        <option value="quiz">Quiz</option>
                      </select>
                      <input className="field" disabled={disabled} type="number" min={1} aria-label="Minutes" value={lesson.minutes} onChange={(event) => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].lessons[lessonIndex].minutes = Number(event.target.value) || 1; })} />
                    </div>
                    <textarea className="field mt-2 min-h-16" disabled={disabled} aria-label="Lesson body" value={lesson.body} onChange={(event) => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].lessons[lessonIndex].body = event.target.value; })} />
                    <div className="mt-2 flex gap-1">
                      <Button variant="quiet" disabled={disabled || lessonIndex === 0} aria-label="Move lesson up" onClick={() => updateCourse(courseId, (draft) => {
                        const lessons = draft.modules[moduleIndex].lessons;
                        const [item] = lessons.splice(lessonIndex, 1);
                        lessons.splice(lessonIndex - 1, 0, item);
                      })}><ChevronUp size={16} /></Button>
                      <Button variant="quiet" disabled={disabled || lessonIndex === module.lessons.length - 1} aria-label="Move lesson down" onClick={() => updateCourse(courseId, (draft) => {
                        const lessons = draft.modules[moduleIndex].lessons;
                        const [item] = lessons.splice(lessonIndex, 1);
                        lessons.splice(lessonIndex + 1, 0, item);
                      })}><ChevronDown size={16} /></Button>
                      <Button variant="quiet" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => { draft.modules[moduleIndex].lessons = draft.modules[moduleIndex].lessons.filter((item) => item.id !== lesson.id); })}>Remove</Button>
                    </div>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => {
                draft.modules[moduleIndex].lessons.push({
                  id: newId("lesson"),
                  title: "New lesson",
                  type: "text",
                  minutes: 10,
                  summary: "A short practice note.",
                  body: "Write what the learner should do in this lesson.",
                });
              })}><Plus size={16} /> Add lesson</Button>
              {course.modules.length > 1 ? <Button variant="danger" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => { draft.modules = draft.modules.filter((item) => item.id !== module.id); })}>Remove module</Button> : null}
            </div>
          ) : null}
        </section>
      ))}
      <Button variant="secondary" disabled={disabled} onClick={() => updateCourse(courseId, (draft) => {
        draft.modules.push({ id: newId("module"), title: `Module ${draft.modules.length + 1}`, summary: "What this stretch is for.", lessons: [] });
      })}>Add module</Button>
    </div>
  );
}

function Assessments({ courseId, disabled }: { courseId: string; disabled: boolean }) {
  const { state, updateCourse } = useStore();
  const quizzes = state.quizzes.filter((quiz) => quiz.courseId === courseId);
  if (quizzes.length === 0) return <EmptyState title="No quiz yet" body="Add a lesson and set its type to Quiz. A prepared question is created with it." />;
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <section key={quiz.id} className="rounded-[14px] border border-line bg-card p-4">
          <label className="text-[13px] font-medium">Quiz title
            <input className="field mt-1" disabled={disabled} value={quiz.title} onChange={(event) => updateCourse(courseId, (_course, draft) => {
              const current = draft.quizzes.find((item) => item.id === quiz.id);
              if (current) current.title = event.target.value;
            })} />
          </label>
          <ul className="mt-3 space-y-3">
            {quiz.questions.map((question, index) => (
              <li key={question.id}>
                <label className="text-[13px]">Question {index + 1}
                  <textarea className="field mt-1 min-h-16" disabled={disabled} value={question.prompt} onChange={(event) => updateCourse(courseId, (_course, draft) => {
                    const current = draft.quizzes.find((item) => item.id === quiz.id);
                    if (current) current.questions[index].prompt = event.target.value;
                  })} />
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Preview({ courseId }: { courseId: string }) {
  const { state } = useStore();
  const course = courseById(state, courseId);
  if (!course) return null;
  const instructor = userById(state, course.instructorId);
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-card">
      <CourseArt course={course} />
      <div className="p-5">
        <Pill tone={course.status === "published" ? "teal" : "neutral"}>{course.status}</Pill>
        <h2 className="mt-3 text-[24px] font-semibold">{course.title}</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-muted">{course.overview || course.summary || "Add an overview to preview it here."}</p>
        <p className="mt-3 text-[13px] text-muted">{instructor?.name} · {course.level}</p>
        <ol className="mt-4 space-y-2">
          {course.modules.map((module) => (
            <li key={module.id}>
              <p className="text-[14px] font-medium">{module.title}</p>
              <p className="text-[12px] text-muted">{module.lessons.map((lesson) => lesson.title).join(" · ") || "No lessons yet"}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
