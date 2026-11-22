import { monthKey } from "./format";
import { DEMO_TODAY, type Course, type DemoState, type Enrollment, type Role, type User } from "./types";

export const TREND_MONTHS = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];

export function flatLessons(course: Course) {
  return course.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, module })));
}

export function courseMinutes(course: Course) {
  return flatLessons(course).reduce((sum, lesson) => sum + lesson.minutes, 0);
}

export function userById(state: DemoState, id: string) {
  return state.users.find((user) => user.id === id);
}

export function courseById(state: DemoState, id: string) {
  return state.courses.find((course) => course.id === id);
}

export function sessionUser(state: DemoState, role?: Role) {
  if (!state.sessionUserId) return undefined;
  const user = userById(state, state.sessionUserId);
  if (!user) return undefined;
  if (role && user.role !== role) return undefined;
  return user;
}

export function enrollmentView(course: Course, enrollment?: Enrollment) {
  const lessons = flatLessons(course);
  const total = lessons.length;
  const doneIds = new Set(enrollment?.completedLessonIds ?? []);
  const done = lessons.filter((lesson) => doneIds.has(lesson.id)).length;
  const progress = total ? Math.round((done / total) * 100) : 0;
  const status = !enrollment || done === 0 ? "not_started" : done >= total ? "completed" : "in_progress";
  const next = lessons.find((lesson) => !doneIds.has(lesson.id));
  return { done, total, progress, status, next, lessons };
}

export function learnersOf(state: DemoState) {
  return state.users.filter((user) => user.role === "learner");
}

export function engagementBreakdown(state: DemoState) {
  const learners = learnersOf(state);
  const order = [
    { key: "active" as const, label: "Active" },
    { key: "at_risk" as const, label: "At risk" },
    { key: "inactive" as const, label: "Inactive" },
    { key: "completed" as const, label: "Completed" },
  ];
  return order.map((item) => ({
    ...item,
    count: learners.filter((learner) => learner.engagement === item.key).length,
  }));
}

export function publishedCourses(state: DemoState) {
  return state.courses.filter((course) => course.status === "published");
}

export function completionStats(enrollments: Enrollment[]) {
  const total = enrollments.length;
  const completed = enrollments.filter((item) => item.completedAt || false).length;
  return { total, completed, rate: total ? completed / total : 0 };
}

export function isCompletedEnrollment(state: DemoState, enrollment: Enrollment) {
  const course = courseById(state, enrollment.courseId);
  if (!course) return false;
  return enrollmentView(course, enrollment).status === "completed";
}

export function orgCompletion(state: DemoState, enrollments = state.enrollments) {
  const rows = enrollments.map((enrollment) => ({
    enrollment,
    completed: isCompletedEnrollment(state, enrollment),
  }));
  const total = rows.length;
  const completed = rows.filter((row) => row.completed).length;
  return { total, completed, rate: total ? completed / total : 0 };
}

export function monthlyTrend(enrollments: Enrollment[]) {
  return TREND_MONTHS.map((key) => ({
    key,
    label: new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    enrollments: enrollments.filter((item) => monthKey(item.enrolledAt) === key).length,
    completions: enrollments.filter((item) => item.completedAt && monthKey(item.completedAt) === key).length,
  }));
}

export function courseRows(state: DemoState, enrollments = state.enrollments) {
  return state.courses
    .filter((course) => course.status === "published")
    .map((course) => {
      const rows = enrollments.filter((item) => item.courseId === course.id);
      const completed = rows.filter((item) => isCompletedEnrollment(state, item)).length;
      const started = rows.filter((item) => !isCompletedEnrollment(state, item) && enrollmentView(course, item).done > 0).length;
      const notStarted = rows.length - completed - started;
      return {
        course,
        enrolled: rows.length,
        completed,
        started,
        notStarted,
        rate: rows.length ? completed / rows.length : 0,
      };
    });
}

export function attentionCourses(state: DemoState) {
  return courseRows(state)
    .filter((row) => row.enrolled > 0)
    .sort((a, b) => a.rate - b.rate || a.course.title.localeCompare(b.course.title));
}

export function activeCourseDelta(state: DemoState) {
  const active = publishedCourses(state).length;
  const previous = state.courses.filter(
    (course) => course.status === "published" && course.publishedAt && course.publishedAt < "2026-11-01",
  ).length;
  return { active, previous, delta: active - previous };
}

export function filteredEnrollments(
  state: DemoState,
  filters: { category?: string; range?: "all" | "30d" | "november"; instructorId?: string },
) {
  return state.enrollments.filter((enrollment) => {
    const course = courseById(state, enrollment.courseId);
    if (!course || course.status !== "published") return false;
    if (filters.category && course.category !== filters.category) return false;
    if (filters.instructorId && course.instructorId !== filters.instructorId) return false;
    if (filters.range === "30d" && (enrollment.enrolledAt < "2026-10-20" || enrollment.enrolledAt > DEMO_TODAY)) return false;
    if (filters.range === "november" && !enrollment.enrolledAt.startsWith("2026-11")) return false;
    return true;
  });
}

export function recommendationsFor(state: DemoState, learnerId: string) {
  const enrolled = new Set(
    state.enrollments.filter((item) => item.learnerId === learnerId).map((item) => item.courseId),
  );
  const tags = new Set(
    state.courses.filter((course) => enrolled.has(course.id)).flatMap((course) => course.tags),
  );
  return state.courses
    .filter((course) => course.status === "published" && !enrolled.has(course.id))
    .map((course) => ({
      course,
      overlap: course.tags.filter((tag) => tags.has(tag)),
    }))
    .filter((item) => item.overlap.length > 0)
    .sort((a, b) => b.overlap.length - a.overlap.length || a.course.title.localeCompare(b.course.title));
}

export function learnerEnrollments(state: DemoState, learnerId: string) {
  return state.enrollments
    .filter((item) => item.learnerId === learnerId)
    .map((enrollment) => {
      const course = courseById(state, enrollment.courseId);
      return course ? { enrollment, course, view: enrollmentView(course, enrollment) } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

export function upcomingEvents(state: DemoState, from = DEMO_TODAY, limit = 4) {
  return state.events
    .filter((event) => event.date >= from)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function instructorCourseIds(state: DemoState, instructorId: string) {
  return state.courses.filter((course) => course.instructorId === instructorId).map((course) => course.id);
}

export function peopleForInstructor(state: DemoState, instructorId: string) {
  const ids = new Set(instructorCourseIds(state, instructorId));
  const learnerIds = new Set(
    state.enrollments.filter((item) => ids.has(item.courseId)).map((item) => item.learnerId),
  );
  return state.users.filter((user) => learnerIds.has(user.id));
}

export function submissionsFor(state: DemoState, instructorId?: string) {
  return state.submissions.filter((submission) => {
    if (!instructorId) return true;
    const course = courseById(state, submission.courseId);
    return course?.instructorId === instructorId;
  });
}

export function findLesson(course: Course, lessonId: string) {
  for (const current of course.modules) {
    const lesson = current.lessons.find((item) => item.id === lessonId);
    if (lesson) return { module: current, lesson };
  }
  return null;
}

export function adjacentLessons(course: Course, lessonId: string) {
  const lessons = flatLessons(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
    index,
    total: lessons.length,
  };
}

export function achievementsFor(state: DemoState, learnerId: string) {
  const rows = learnerEnrollments(state, learnerId);
  const lessonsDone = rows.reduce((sum, row) => sum + row.view.done, 0);
  const coursesCompleted = rows.filter((row) => row.view.status === "completed").length;
  const coursesStarted = rows.filter((row) => row.view.done > 0).length;
  const passed = state.attempts.some((attempt) => attempt.learnerId === learnerId && attempt.score >= 70);
  const moduleDone = rows.some((row) =>
    row.course.modules.some((module) => module.lessons.every((lesson) => row.enrollment.completedLessonIds.includes(lesson.id)) && module.lessons.length > 0),
  );
  return [
    { id: "start", title: "Started a course", detail: "Complete the first lesson in any course.", unlocked: coursesStarted > 0 },
    { id: "five", title: "Five lessons in", detail: "Finish five lessons across your courses.", unlocked: lessonsDone >= 5 },
    { id: "module", title: "Module complete", detail: "Finish every lesson in a module.", unlocked: moduleDone },
    { id: "quiz", title: "Checkpoint passed", detail: "Score 70% or more on an assessment.", unlocked: passed },
    { id: "course", title: "Course complete", detail: "Finish every lesson in a course.", unlocked: coursesCompleted > 0 },
  ];
}

export function searchRecords(state: DemoState, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return { courses: [], people: [] as User[] };
  return {
    courses: state.courses.filter((course) =>
      `${course.title} ${course.category} ${course.summary}`.toLowerCase().includes(needle),
    ),
    people: state.users.filter((user) => `${user.name} ${user.email} ${user.title}`.toLowerCase().includes(needle)),
  };
}
