"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { formatDate, formatDuration, formatLongDate } from "@/lib/format";
import {
  achievementsFor,
  adjacentLessons,
  courseById,
  courseMinutes,
  enrollmentView,
  findLesson,
  learnerEnrollments,
  sessionUser,
  userById,
} from "@/lib/metrics";
import { useStore } from "@/lib/store";
import type { CourseLevel } from "@/lib/types";
import { Button, ConfirmDialog, Drawer, EmptyState, ErrorState, PageHeader, Pill, ProgressBar } from "../ui";
import { CalendarPanel, CourseArt, CourseCard } from "../widgets";

export function Catalogue() {
  const { state, enroll } = useStore();
  const learner = sessionUser(state, "learner");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("title");
  const [view, setView] = useState<"cards" | "list">("cards");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const enrolled = new Set(state.enrollments.filter((item) => item.learnerId === learner?.id).map((item) => item.courseId));

  const courses = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return state.courses
      .filter((course) => course.status === "published")
      .filter((course) => (category === "all" ? true : course.category === category))
      .filter((course) => (level === "all" ? true : course.level === level))
      .filter((course) => {
        if (status === "all" || !learner) return true;
        const enrollment = state.enrollments.find((item) => item.learnerId === learner.id && item.courseId === course.id);
        const viewState = enrollmentView(course, enrollment).status;
        if (status === "enrolled") return Boolean(enrollment) && viewState !== "completed";
        if (status === "completed") return viewState === "completed";
        return !enrollment;
      })
      .filter((course) => !needle || `${course.title} ${course.summary} ${course.category}`.toLowerCase().includes(needle))
      .sort((a, b) => {
        if (sort === "duration") return courseMinutes(a) - courseMinutes(b);
        if (sort === "level") return a.level.localeCompare(b.level);
        return a.title.localeCompare(b.title);
      });
  }, [category, learner, level, query, sort, state.courses, state.enrollments, status]);

  const filters = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-[13px]">Category
        <select className="field mt-1" value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {state.categories.map((item) => <option key={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="text-[13px]">Level
        <select className="field mt-1" value={level} onChange={(event) => setLevel(event.target.value)}>
          <option value="all">All levels</option>
          {(["Beginner", "Intermediate", "Advanced"] as CourseLevel[]).map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="text-[13px]">Status
        <select className="field mt-1" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Any status</option>
          <option value="available">Not enrolled</option>
          <option value="enrolled">In progress or not started</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <label className="text-[13px]">Sort
        <select className="field mt-1" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="title">Title</option>
          <option value="duration">Duration</option>
          <option value="level">Level</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="Explore courses" description="Published courses you can enroll in." actions={
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</Button>
          <div className="flex rounded-[11px] border border-line p-1">
            <button type="button" aria-pressed={view === "cards"} className={`grid h-8 w-8 place-items-center rounded-[8px] ${view === "cards" ? "bg-elevated" : ""}`} onClick={() => setView("cards")}><LayoutGrid size={16} /><span className="sr-only">Card view</span></button>
            <button type="button" aria-pressed={view === "list"} className={`grid h-8 w-8 place-items-center rounded-[8px] ${view === "list" ? "bg-elevated" : ""}`} onClick={() => setView("list")}><List size={16} /><span className="sr-only">List view</span></button>
          </div>
        </div>
      } />
      <input className="field max-w-md" placeholder="Search courses" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search courses" />
      <div className="hidden lg:block">{filters}</div>
      <Drawer open={filtersOpen} title="Filters" side="bottom" onClose={() => setFiltersOpen(false)}>
        {filters}
        <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>Show {courses.length} courses</Button>
      </Drawer>
      {courses.length === 0 ? <EmptyState title="No courses yet" body="Published courses will appear here." /> : null}
      {view === "cards" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const enrollment = state.enrollments.find((item) => item.learnerId === learner?.id && item.courseId === course.id);
            const progress = enrollment ? enrollmentView(course, enrollment) : null;
            return (
              <CourseCard
                key={course.id}
                course={course}
                instructor={userById(state, course.instructorId)}
                href={`/learn/courses/${course.id}`}
                action={progress?.status === "completed" ? "Review course" : progress ? "Continue" : "View course"}
                progress={progress?.progress}
              />
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-[14px] border border-line bg-card">
          {courses.map((course) => (
            <li key={course.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="w-full sm:w-40"><CourseArt course={course} className="rounded-[10px]" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-muted">{course.category} · {course.level}</p>
                <Link href={`/learn/courses/${course.id}`} className="text-[15px] font-semibold">{course.title}</Link>
                <p className="text-[13px] text-muted">{formatDuration(courseMinutes(course))} · {userById(state, course.instructorId)?.name}</p>
              </div>
              <Button variant="secondary" onClick={() => enroll(course.id)} disabled={enrolled.has(course.id)}>{enrolled.has(course.id) ? "Enrolled" : "Enroll"}</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CourseDetail() {
  const params = useParams<{ id: string }>();
  const { state, enroll } = useStore();
  const course = courseById(state, params.id);
  const learner = sessionUser(state, "learner");
  const [openModule, setOpenModule] = useState<string | null>(course?.modules[0]?.id ?? null);
  if (!course || course.status !== "published") return <ErrorState title="Course unavailable" body="That course is not in the published catalogue." />;
  const enrollment = state.enrollments.find((item) => item.learnerId === learner?.id && item.courseId === course.id);
  const view = enrollmentView(course, enrollment);
  const instructor = userById(state, course.instructorId);
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-[14px] border border-line bg-card lg:grid lg:grid-cols-5">
        <CourseArt course={course} className="lg:col-span-2 lg:aspect-auto lg:min-h-full" />
        <div className="p-5 lg:col-span-3">
          <p className="text-[12px] text-muted">{course.category} · {course.level}</p>
          <h1 className="mt-1 text-[28px] font-semibold leading-tight">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted">{course.overview}</p>
          <p className="mt-4 text-[13px] text-muted">{instructor?.name} · {formatDuration(courseMinutes(course))} · {view.total} lessons</p>
          {enrollment ? <div className="mt-4 max-w-sm"><ProgressBar value={view.progress} label="Your progress" /><p className="mt-1 text-[12px] text-muted">{view.done} of {view.total} lessons</p></div> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {view.next ? (
              <Link href={`/learn/courses/${course.id}/lessons/${view.next.id}`} className="inline-flex h-10 items-center rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]">{enrollment ? "Continue" : "Preview first lesson"}</Link>
            ) : <Pill tone="green">Completed</Pill>}
            {!enrollment ? <Button variant="secondary" onClick={() => enroll(course.id)}>Enroll in demo</Button> : null}
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[14px] border border-line bg-card p-4 lg:col-span-2">
          <h2 className="text-[16px] font-semibold">Curriculum</h2>
          <div className="mt-3 space-y-2">
            {course.modules.map((module) => {
              const open = openModule === module.id;
              return (
                <div key={module.id} className="rounded-[12px] border border-line">
                  <button type="button" className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left" aria-expanded={open} onClick={() => setOpenModule(open ? null : module.id)}>
                    <span>
                      <span className="block text-[14px] font-medium">{module.title}</span>
                      <span className="block text-[12px] text-muted">{module.summary}</span>
                    </span>
                    <span className="text-[12px] text-muted">{module.lessons.length} lessons</span>
                  </button>
                  {open ? (
                    <ul className="border-t border-line">
                      {module.lessons.map((lesson) => {
                        const done = enrollment?.completedLessonIds.includes(lesson.id);
                        return (
                          <li key={lesson.id}>
                            <Link href={`/learn/courses/${course.id}/lessons/${lesson.id}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px] hover:bg-elevated">
                              <span>{lesson.title}</span>
                              <span className="text-muted">{done ? "Done" : `${lesson.minutes} min`}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
        <aside className="space-y-4">
          <section className="rounded-[14px] border border-line bg-card p-4">
            <h2 className="text-[16px] font-semibold">Outcomes</h2>
            <ul className="mt-3 space-y-2 text-[13px] leading-6">
              {course.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}
            </ul>
          </section>
          {instructor ? (
            <section className="rounded-[14px] border border-line bg-card p-4">
              <h2 className="text-[16px] font-semibold">Instructor</h2>
              <p className="mt-2 text-[14px] font-medium">{instructor.name}</p>
              <p className="text-[12px] text-muted">{instructor.title}</p>
              <p className="mt-2 text-[13px] leading-6 text-muted">{instructor.bio}</p>
            </section>
          ) : null}
          {course.assignment ? (
            <section className="rounded-[14px] border border-line bg-card p-4">
              <h2 className="text-[16px] font-semibold">Assignment</h2>
              <p className="mt-2 text-[14px] font-medium">{course.assignment.title}</p>
              <p className="text-[12px] text-muted">Due {formatDate(course.assignment.due)}</p>
              <Link href="/learn/assignments" className="mt-3 inline-block text-[13px] font-medium text-blue">Open assignments</Link>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

export function LessonPlayer() {
  const params = useParams<{ id: string; lessonId: string }>();
  const { state, setLessonComplete } = useStore();
  const [outline, setOutline] = useState(false);
  const course = courseById(state, params.id);
  const found = course ? findLesson(course, params.lessonId) : null;
  const learner = sessionUser(state, "learner");
  if (!course || !found) return <ErrorState title="Lesson not found" body="This lesson is not in the demo catalogue." />;
  const enrollment = state.enrollments.find((item) => item.learnerId === learner?.id && item.courseId === course.id);
  const done = Boolean(enrollment?.completedLessonIds.includes(found.lesson.id));
  const neighbors = adjacentLessons(course, found.lesson.id);
  const outlineList = (
    <ol className="space-y-3">
      {course.modules.map((module) => (
        <li key={module.id}>
          <p className="text-[12px] font-medium text-muted">{module.title}</p>
          <ul className="mt-1">
            {module.lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/learn/courses/${course.id}/lessons/${lesson.id}`} className={`block rounded-[8px] px-2 py-1.5 text-[13px] ${lesson.id === found.lesson.id ? "bg-elevated font-medium" : "hover:bg-elevated"}`} onClick={() => setOutline(false)}>
                  {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article className="min-w-0">
        <p className="text-[12px] text-muted"><Link href={`/learn/courses/${course.id}`} className="text-blue">{course.title}</Link> · {found.module.title}</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-[26px] font-semibold leading-tight">{found.lesson.title}</h1>
          <Button variant="secondary" className="lg:hidden" onClick={() => setOutline(true)}>Lessons</Button>
        </div>
        <p className="mt-2 text-[13px] text-muted">Lesson {(neighbors.index ?? 0) + 1} of {neighbors.total} · {found.lesson.minutes} min · {found.lesson.type}</p>
        <div className="mt-6 max-w-[720px]">
          <p className="text-[15px] leading-7">{found.lesson.summary}</p>
          <LessonBody courseId={course.id} lesson={found.lesson} />
          <p className="mt-4 text-[15px] leading-7">{found.lesson.body}</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {neighbors.previous ? <Link href={`/learn/courses/${course.id}/lessons/${neighbors.previous.id}`} className="inline-flex h-10 items-center rounded-[11px] border border-line px-3 text-[14px]">Previous</Link> : null}
          {neighbors.next ? <Link href={`/learn/courses/${course.id}/lessons/${neighbors.next.id}`} className="inline-flex h-10 items-center rounded-[11px] border border-line px-3 text-[14px]">Next</Link> : null}
          <Button disabled={!enrollment} onClick={() => setLessonComplete(course.id, found.lesson.id, !done)}>{done ? "Mark incomplete" : "Mark complete"}</Button>
        </div>
        {!enrollment ? <p className="mt-3 text-[13px] text-muted">Enroll from the course page to save progress.</p> : null}
      </article>
      <aside className="hidden lg:block">
        <div className="sticky top-20 rounded-[14px] border border-line bg-card p-4">
          <h2 className="text-[14px] font-semibold">Lessons</h2>
          <div className="mt-3">{outlineList}</div>
        </div>
      </aside>
      <Drawer open={outline} title="Lessons" side="right" onClose={() => setOutline(false)}>{outlineList}</Drawer>
    </div>
  );
}

function LessonBody({ courseId, lesson }: { courseId: string; lesson: { type: string; title: string; minutes: number; resourceName?: string; quizId?: string } }) {
  const { toast } = useStore();
  if (lesson.type === "video") {
    return (
      <div className="mt-5 overflow-hidden rounded-[14px] border border-line bg-[#101820]">
        <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-[#d5dee8]">
          <p className="text-[14px] font-medium">Video placeholder</p>
          <p className="mt-2 max-w-md text-[13px] leading-6 text-[#9eacbc]">No live video provider is connected. {lesson.minutes} minutes are reserved for “{lesson.title}”.</p>
        </div>
      </div>
    );
  }
  if (lesson.type === "resource") {
    return (
      <div className="mt-5 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-elevated p-4">
        <div>
          <p className="text-[14px] font-medium">{lesson.resourceName}</p>
          <p className="text-[12px] text-muted">File storage is not connected.</p>
        </div>
        <Button variant="secondary" onClick={() => toast("Demo only — the file was not downloaded", "info")}>Simulate download</Button>
      </div>
    );
  }
  if (lesson.type === "quiz" && lesson.quizId) {
    return (
      <div className="mt-5 rounded-[14px] border border-line p-4">
        <p className="text-[14px] font-medium">This lesson is an assessment.</p>
        <Link href={`/learn/assessments/${lesson.quizId}`} className="mt-3 inline-flex h-10 items-center rounded-[11px] bg-blue px-3.5 text-[14px] font-medium text-[var(--on-action)]">Open assessment</Link>
        <p className="mt-2 text-[12px] text-muted">Course {courseId}</p>
      </div>
    );
  }
  return null;
}

export function AssessmentList() {
  const { state } = useStore();
  const learner = sessionUser(state, "learner");
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Assessments" title="Checks" description="Sample checks are listed here. Enroll in the course before you start. Scores stay in this browser." />
      <ul className="grid gap-3">
        {state.quizzes.map((quiz) => {
          const course = courseById(state, quiz.courseId);
          const enrolled = state.enrollments.some((item) => item.learnerId === learner?.id && item.courseId === quiz.courseId);
          const attempt = state.attempts.find((item) => item.learnerId === learner?.id && item.quizId === quiz.id);
          return (
            <li key={quiz.id} className="rounded-[14px] border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-muted">{course?.title}</p>
                  <h2 className="text-[16px] font-semibold">{quiz.title}</h2>
                  <p className="mt-1 text-[13px] text-muted">{quiz.questions.length} questions · {quiz.minutes} min</p>
                </div>
                {attempt ? <Pill tone={attempt.score >= 70 ? "green" : "orange"}>{attempt.score}% · {attempt.score >= 70 ? "Passed" : "Try again"}</Pill> : <Pill>Not started</Pill>}
              </div>
              {enrolled ? <Link href={`/learn/assessments/${quiz.id}`} className="mt-3 inline-flex h-10 items-center rounded-[11px] bg-[#CFAC87] px-3.5 text-[13px] font-medium text-[#392E27]">{attempt ? "Review attempt" : "Start"}</Link> : <Link href={`/learn/catalogue/${quiz.courseId}`} className="mt-3 inline-block text-[13px] font-medium text-[#87715F]">Enroll to start</Link>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AssessmentPlayer() {
  const params = useParams<{ id: string }>();
  const { state, submitQuiz } = useStore();
  const quiz = state.quizzes.find((item) => item.id === params.id);
  const learner = sessionUser(state, "learner");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<"edit" | "confirm" | "loading" | "error" | "done">("edit");
  const [failNext, setFailNext] = useState(false);
  const [result, setResult] = useState<{ score: number; answers: number[] } | null>(null);
  if (!quiz) return <ErrorState title="Assessment not found" body="This check is not in the demo." />;
  const course = courseById(state, quiz.courseId);
  const enrolled = state.enrollments.some((item) => item.learnerId === learner?.id && item.courseId === quiz.courseId);
  const saved = state.attempts.find((item) => item.learnerId === learner?.id && item.quizId === quiz.id);
  const showing = result ?? (saved ? { score: saved.score, answers: saved.answers } : null);
  const answered = quiz.questions.filter((question) => answers[question.id] !== undefined).length;

  if (!enrolled) return <ErrorState title="Enroll first" body="This assessment belongs to a course you have not joined in the demo." action={<Link href={`/learn/courses/${quiz.courseId}`} className="text-blue">Open course</Link>} />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader eyebrow={course?.title} title={quiz.title} description={`${answered} of ${quiz.questions.length} answered. Demo scoring only.`} />
      <label className="flex items-center gap-2 text-[13px] text-muted">
        <input type="checkbox" checked={failNext} onChange={(event) => setFailNext(event.target.checked)} />
        Simulate a failed submit once, so the error state is visible
      </label>
      {phase === "loading" ? <div className="h-40 animate-pulse rounded-[14px] bg-elevated" aria-label="Submitting" /> : null}
      {phase === "error" ? <ErrorState title="Submit did not go through" body="This was a simulated failure. Your answers are still on the page." action={<Button onClick={() => setPhase("edit")}>Back to questions</Button>} /> : null}
      {phase !== "loading" && phase !== "error" && showing && phase === "done" ? <Result quiz={quiz} score={showing.score} answers={showing.answers} onRetry={() => { setResult(null); setPhase("edit"); }} /> : null}
      {phase !== "loading" && phase !== "error" && !(showing && phase === "done") ? (
        <ol className="space-y-4">
          {quiz.questions.map((question, index) => (
            <li key={question.id} className="rounded-[14px] border border-line bg-card p-4">
              <p className="text-[12px] text-muted">Question {index + 1}</p>
              <p className="mt-1 text-[15px] font-medium leading-6">{question.prompt}</p>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => (
                  <label key={option} className="flex cursor-pointer items-start gap-2 rounded-[10px] border border-line px-3 py-2 text-[14px] has-checked:border-blue">
                    <input type="radio" name={question.id} checked={answers[question.id] === optionIndex} onChange={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      {phase === "edit" ? <Button disabled={answered !== quiz.questions.length} onClick={() => setPhase("confirm")}>Review and submit</Button> : null}
      {saved && phase === "edit" ? <p className="text-[13px] text-muted">A previous score of {saved.score}% is saved. Submitting replaces it.</p> : null}
      <ConfirmDialog
        open={phase === "confirm"}
        title="Submit this attempt?"
        body="You can try again later. The score is stored only in this browser."
        confirmLabel="Submit"
        onClose={() => setPhase("edit")}
        onConfirm={() => {
          setPhase("loading");
          window.setTimeout(() => {
            if (failNext) {
              setFailNext(false);
              setPhase("error");
              return;
            }
            const ordered = quiz.questions.map((question) => answers[question.id]);
            const attempt = submitQuiz(quiz.id, ordered);
            if (attempt) setResult({ score: attempt.score, answers: attempt.answers });
            setPhase("done");
          }, 700);
        }}
      />
    </div>
  );
}

function Result({
  quiz,
  score,
  answers,
  onRetry,
}: {
  quiz: { questions: Array<{ id: string; prompt: string; options: string[]; correctIndex: number; feedback: string }> };
  score: number;
  answers: number[];
  onRetry: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-line bg-card p-4">
        <p className="text-[13px] text-muted">{score >= 70 ? "Passed" : "Below 70%"}</p>
        <p className="text-[28px] font-semibold">{score}%</p>
        <Button variant="secondary" className="mt-3" onClick={onRetry}>Try again</Button>
      </div>
      <ol className="space-y-3">
        {quiz.questions.map((question, index) => {
          const picked = answers[index];
          const correct = picked === question.correctIndex;
          return (
            <li key={question.id} className="rounded-[14px] border border-line p-4">
              <p className="text-[14px] font-medium">{question.prompt}</p>
              <p className="mt-2 text-[13px]">{correct ? "Your answer matches the prepared key." : `You chose “${question.options[picked] ?? "nothing"}.”`} The prepared answer is “{question.options[question.correctIndex]}”.</p>
              <p className="mt-2 text-[13px] leading-6 text-muted">{question.feedback}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function Assignments() {
  const { state, submitAssignment } = useStore();
  const learner = sessionUser(state, "learner");
  const [filter, setFilter] = useState("all");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const rows = learnerEnrollments(state, learner?.id ?? "").filter((row) => row.course.assignment);
  const available = state.courses.filter((course) => course.status === "published" && course.assignment && !rows.some((row) => row.course.id === course.id));
  const visible = rows.filter((row) => {
    const submission = state.submissions.find((item) => item.learnerId === learner?.id && item.courseId === row.course.id);
    if (filter === "pending") return submission?.status === "pending";
    if (filter === "reviewed") return submission?.status === "reviewed";
    if (filter === "open") return !submission;
    return true;
  });
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Assignments" title="Submissions" description="Write a response and it appears in the instructor review queue in this browser." />
      <select className="field max-w-xs" aria-label="Filter assignments" value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="all">All</option>
        <option value="open">Not submitted</option>
        <option value="pending">Pending</option>
        <option value="reviewed">Reviewed</option>
      </select>
      {visible.length === 0 && available.length === 0 ? <EmptyState title="Nothing in this filter" body="Enroll in a course with an assignment, or change the filter." /> : null}
      {available.length ? (
        <section>
          <h2 className="text-[15px] font-semibold">Available after enrollment</h2>
          <ul className="mt-3 space-y-3">
            {available.map((course) => (
              <li key={course.id} className="rounded-[14px] border border-line bg-card p-4">
                <p className="text-[12px] text-muted">{course.title}{course.sample ? " · Sample" : ""}</p>
                <h3 className="text-[16px] font-semibold">{course.assignment?.title}</h3>
                <p className="mt-1 text-[13px] text-muted">Due {formatLongDate(course.assignment?.due ?? "")}</p>
                <p className="mt-2 text-[14px] leading-6">{course.assignment?.prompt}</p>
                <Link href={`/learn/catalogue/${course.id}`} className="mt-3 inline-flex h-10 items-center rounded-[11px] bg-[#CFAC87] px-3.5 text-[14px] font-medium text-[#392E27]">Enroll to submit</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ul className="space-y-4">
        {visible.map((row) => {
          const submission = state.submissions.find((item) => item.learnerId === learner?.id && item.courseId === row.course.id);
          return (
            <li key={row.course.id} className="rounded-[14px] border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] text-muted">{row.course.title}</p>
                  <h2 className="text-[16px] font-semibold">{row.course.assignment?.title}</h2>
                  <p className="mt-1 text-[13px] text-muted">Due {formatLongDate(row.course.assignment?.due ?? "")}</p>
                </div>
                <Pill tone={submission?.status === "reviewed" ? "green" : submission ? "orange" : "neutral"}>{submission?.status ?? "Not submitted"}</Pill>
              </div>
              <p className="mt-3 text-[14px] leading-6">{row.course.assignment?.prompt}</p>
              {submission ? (
                <div className="mt-3 rounded-[12px] bg-elevated p-3 text-[13px] leading-6">
                  <p>{submission.body}</p>
                  {submission.feedback ? <p className="mt-2 text-muted">Feedback · {submission.score}/100 · {submission.feedback}</p> : <p className="mt-2 text-muted">Waiting for a reviewer.</p>}
                </div>
              ) : (
                <form className="mt-3" onSubmit={(event) => {
                  event.preventDefault();
                  const message = submitAssignment(row.course.id, drafts[row.course.id] ?? "");
                  setError(message ?? "");
                }}>
                  <label className="text-[13px] font-medium" htmlFor={`work-${row.course.id}`}>Your response</label>
                  <textarea id={`work-${row.course.id}`} className="field mt-1 min-h-28" value={drafts[row.course.id] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [row.course.id]: event.target.value }))} />
                  {error ? <p className="mt-1 text-[12px] text-red">{error}</p> : null}
                  <Button className="mt-3" type="submit">Submit assignment</Button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function CalendarPage() {
  const { state } = useStore();
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Calendar" title="Important dates" description="Sample dates stay on the calendar until a course is replaced. Your own deadlines appear after you enroll." />
      <CalendarPanel events={state.events} weekStartsOn={state.settings.weekStartsOn} />
    </div>
  );
}

export function Achievements() {
  const { state } = useStore();
  const learner = sessionUser(state, "learner");
  if (!learner) return null;
  const items = achievementsFor(state, learner.id);
  const rows = learnerEnrollments(state, learner.id);
  const done = rows.filter((row) => row.view.status === "completed");
  const closest = rows.filter((row) => row.view.status !== "completed").sort((a, b) => b.view.progress - a.view.progress)[0];
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Achievements" title="Progress marks" description="Unlocked from lessons and scores in this browser." />
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-[14px] border border-line bg-card p-4">
            <Pill tone={item.unlocked ? "green" : "neutral"}>{item.unlocked ? "Unlocked" : "Locked"}</Pill>
            <h2 className="mt-2 text-[16px] font-semibold">{item.title}</h2>
            <p className="mt-1 text-[13px] text-muted">{item.detail}</p>
          </li>
        ))}
      </ul>
      <section className="rounded-[14px] border border-line bg-card p-5">
        <h2 className="text-[16px] font-semibold">Certificate preview</h2>
        {done.length === 0 ? <p className="mt-2 text-[13px] leading-6 text-muted">No course is complete yet, so this is a preview only. It unlocks when every lesson in a course is marked complete.</p> : null}
        <Certificate name={learner.name} course={done[0]?.course.title ?? closest?.course.title ?? "Evidence Before Charts"} preview={done.length === 0} />
      </section>
    </div>
  );
}

function Certificate({ name, course, preview }: { name: string; course: string; preview: boolean }) {
  return (
    <div className="relative mx-auto mt-4 max-w-xl rounded-[14px] border border-line bg-elevated px-6 py-8 text-center">
      {preview ? <p className="text-[12px] font-medium tracking-wide text-orange">Preview — unlocks when the course is complete</p> : <p className="text-[12px] font-medium text-teal">Demo certificate</p>}
      <p className="mt-4 text-[13px] text-muted">Smart LMS</p>
      <p className="mt-2 text-[24px] font-semibold">{name}</p>
      <p className="mt-2 text-[14px] leading-6">has finished the lessons in</p>
      <p className="mt-1 text-[18px] font-semibold">{course}</p>
      <p className="mt-4 text-[12px] text-muted">Not a verified credential. Stored locally for the prototype.</p>
    </div>
  );
}

