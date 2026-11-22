"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createInitialState } from "./initial-state";
import { applySampleCatalogue } from "./sample-catalogue";
import { courseById, enrollmentView, flatLessons, sessionUser } from "./metrics";
import { authRepository } from "./services/auth-repository";
import { demoStorage } from "./storage";
import { type CategoryStatus, type Course, type DemoState, type OrgSettings, type QuizAttempt, type Role, type ThemeMode, type TicketStatus, type User } from "./types";
import { newId } from "./format";
import { validateEmail, validatePassword } from "./validation";

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function profileFrom(input: { id: string; name: string; email: string; role: Role; status: User["status"] }): User {
  return {
    id: input.id,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: input.status,
    title: input.role === "admin" ? "Administrator" : input.role === "instructor" ? "Instructor" : "Student",
    engagement: input.role === "learner" ? "active" : undefined,
    lastActive: todayStamp(),
    bio: "",
    color: "#D8C8B8",
  };
}

type ToastTone = "success" | "info" | "danger";
type Toast = { id: string; title: string; tone: ToastTone };

type Store = {
  hydrated: boolean;
  state: DemoState;
  toasts: Toast[];
  toast: (title: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setRole: (role: Role) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  resetDemo: () => void;
  register: (input: { name: string; email: string; password: string; role: "learner" | "instructor" }) => Promise<string | null>;
  setupAdmin: (input: { name: string; email: string; password: string }) => Promise<string | null>;
  login: (email: string, password: string, remember: boolean) => Promise<string | null>;
  logout: () => void;
  provisionAccount: (user: User, password?: string) => Promise<string | null>;
  markNotification: (id: string, read: boolean) => void;
  markAllNotifications: () => void;
  enroll: (courseId: string) => void;
  setLessonComplete: (courseId: string, lessonId: string, complete: boolean) => void;
  submitQuiz: (quizId: string, answers: number[]) => QuizAttempt | null;
  submitAssignment: (courseId: string, body: string) => string | null;
  reviewSubmission: (id: string, score: number, feedback: string) => void;
  saveUser: (user: User) => void;
  removeUser: (id: string) => string | null;
  setUserStatus: (id: string, status: User["status"]) => void;
  saveSettings: (settings: OrgSettings) => void;
  addCategory: (name: string, description: string) => string | null;
  saveCategory: (id: string, name: string, description: string, status: CategoryStatus) => string | null;
  removeCategory: (id: string) => string | null;
  setTicketStatus: (id: string, status: TicketStatus) => void;
  saveQuiz: (input: { id?: string; courseId: string; title: string; minutes: number }) => string | null;
  removeQuiz: (id: string) => string | null;
  addAnnouncement: (input: { title: string; body: string; audience: DemoState["announcements"][number]["audience"] }) => void;
  addEvent: (input: { date: string; title: string; kind: DemoState["events"][number]["kind"]; detail: string; courseId?: string }) => string | null;
  createCourse: () => string;
  updateCourse: (courseId: string, recipe: (course: Course, draft: DemoState) => void) => void;
  publishCourse: (courseId: string) => string | null;
  unpublishCourse: (courseId: string) => void;
  discardDraft: (courseId: string) => void;
};

const StoreContext = createContext<Store | null>(null);

function produce(state: DemoState, recipe: (draft: DemoState) => void) {
  const draft = structuredClone(state);
  recipe(draft);
  return draft;
}

function pushActivity(draft: DemoState, text: string, roles: Role[], extra?: { learnerId?: string; instructorId?: string }) {
  draft.activity.unshift({
    id: newId("act"),
    at: new Date().toISOString(),
    text,
    roles,
    ...extra,
  });
  draft.activity = draft.activity.slice(0, 30);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DemoState>(() => createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const stored = applySampleCatalogue(demoStorage.read() ?? createInitialState());
    const sessionUserId = authRepository.readSession();
    const user = sessionUserId ? stored.users.find((item) => item.id === sessionUserId) : undefined;
    if (user) {
      stored.sessionUserId = user.id;
      stored.role = user.role;
    } else {
      if (sessionUserId) authRepository.clearSession();
      stored.sessionUserId = null;
    }
    setState(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    demoStorage.write(state);
    document.documentElement.dataset.theme = state.theme;
  }, [state, hydrated]);

  const api = useMemo<Store>(() => {
    const toast = (title: string, tone: ToastTone = "success") => {
      const id = newId("toast");
      setToasts((current) => [...current, { id, title, tone }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, 3600);
    };
    const patch = (recipe: (draft: DemoState) => void) => setState((current) => produce(current, recipe));

    return {
      hydrated,
      state,
      toasts,
      toast,
      dismissToast: (id) => setToasts((current) => current.filter((item) => item.id !== id)),
      setTheme: (theme) => patch((draft) => { draft.theme = theme; }),
      toggleTheme: () => patch((draft) => { draft.theme = draft.theme === "dark" ? "light" : "dark"; }),
      setRole: (role) => patch((draft) => { draft.role = role; }),
      setSidebarCollapsed: (collapsed) => patch((draft) => { draft.sidebarCollapsed = collapsed; }),
      resetDemo: () => {
        const next = createInitialState();
        next.theme = state.theme;
        next.settings = state.settings;
        const kept = state.users.filter((user) => user.id !== "sample-faculty");
        next.users = [...kept, ...next.users.filter((user) => !kept.some((item) => item.id === user.id))];
        next.sessionUserId = state.sessionUserId;
        next.role = state.role;
        setState(next);
        toast("Learning records cleared on this browser");
      },
      register: async (input) => {
        const emailError = validateEmail(input.email);
        if (input.name.trim().length < 2) return "Enter your full name.";
        if (emailError) return emailError;
        const passwordError = validatePassword(input.password);
        if (passwordError) return passwordError;
        if (input.role !== "learner" && input.role !== "instructor") return "Choose student or instructor.";
        const email = input.email.trim().toLowerCase();
        if (state.users.some((user) => user.email.toLowerCase() === email) || authRepository.findByEmail(email)) {
          return "An account with this email already exists in this browser.";
        }
        const id = newId("user");
        const saved = await authRepository.saveCredential(id, email, input.password);
        if (saved) return saved;
        const status = input.role === "instructor" ? "invited" : "active";
        const user = profileFrom({ id, name: input.name, email, role: input.role, status });
        if (status === "active") authRepository.writeSession(id, true);
        patch((draft) => {
          draft.users.push(user);
          if (status === "active") {
            draft.sessionUserId = id;
            draft.role = user.role;
          }
        });
        toast(status === "active" ? "Account created on this browser" : "Instructor account submitted for approval");
        return null;
      },
      setupAdmin: async (input) => {
        if (state.users.some((user) => user.role === "admin")) return "An administrator already exists on this browser.";
        const emailError = validateEmail(input.email);
        if (input.name.trim().length < 2) return "Enter your full name.";
        if (emailError) return emailError;
        const passwordError = validatePassword(input.password);
        if (passwordError) return passwordError;
        const email = input.email.trim().toLowerCase();
        if (state.users.some((user) => user.email.toLowerCase() === email) || authRepository.findByEmail(email)) {
          return "An account with this email already exists in this browser.";
        }
        const id = newId("user");
        const saved = await authRepository.saveCredential(id, email, input.password);
        if (saved) return saved;
        const user = profileFrom({ id, name: input.name, email, role: "admin", status: "active" });
        authRepository.writeSession(id, true);
        patch((draft) => {
          draft.users.push(user);
          draft.sessionUserId = id;
          draft.role = "admin";
        });
        toast("Administrator account created on this browser");
        return null;
      },
      login: async (email, password, remember) => {
        const account = authRepository.findByEmail(email);
        if (!account) return "No account with that email is stored in this browser.";
        const ok = await authRepository.verify(account, password);
        if (!ok) return "Email or password is incorrect.";
        const user = state.users.find((item) => item.id === account.userId);
        if (!user) return "This sign-in record has no profile in this browser.";
        if (user.status === "suspended") return "This account is suspended.";
        if (user.status === "invited") return "This instructor account is waiting for administrator approval.";
        authRepository.writeSession(user.id, remember);
        patch((draft) => {
          draft.sessionUserId = user.id;
          draft.role = user.role;
          const current = draft.users.find((item) => item.id === user.id);
          if (current) current.lastActive = todayStamp();
        });
        toast("Signed in");
        return null;
      },
      logout: () => {
        authRepository.clearSession();
        patch((draft) => { draft.sessionUserId = null; });
      },
      provisionAccount: async (user, password) => {
        const email = user.email.trim().toLowerCase();
        const emailError = validateEmail(email);
        if (user.name.trim().length < 2) return "Enter a full name.";
        if (emailError) return emailError;
        if (state.users.some((item) => item.id !== user.id && item.email.toLowerCase() === email)) {
          return "An account with this email already exists in this browser.";
        }
        const existing = state.users.some((item) => item.id === user.id);
        if (!existing && !password) return "Set a password so this person can sign in on this browser.";
        if (password) {
          const passwordError = validatePassword(password);
          if (passwordError) return passwordError;
          const saved = await authRepository.saveCredential(user.id, email, password);
          if (saved) return saved;
        } else {
          authRepository.updateEmail(user.id, email);
        }
        patch((draft) => {
          const next = { ...user, email, name: user.name.trim() };
          const index = draft.users.findIndex((item) => item.id === user.id);
          if (index >= 0) draft.users[index] = next;
          else draft.users.push(next);
        });
        toast(existing ? "Person updated" : "Person added on this browser");
        return null;
      },
      markNotification: (id, read) => patch((draft) => {
        const item = draft.notifications.find((note) => note.id === id);
        if (item) item.read = read;
      }),
      markAllNotifications: () => patch((draft) => {
        for (const note of draft.notifications) {
          if (note.roles.includes(draft.role)) note.read = true;
        }
      }),
      enroll: (courseId) => {
        const learner = sessionUser(state, "learner");
        const course = courseById(state, courseId);
        if (!learner || !course) return;
        if (state.enrollments.some((item) => item.learnerId === learner.id && item.courseId === courseId)) {
          toast("You are already enrolled", "info");
          return;
        }
        patch((draft) => {
          draft.enrollments.push({
            id: `${learner.id}-${courseId}`,
            learnerId: learner.id,
            courseId,
            completedLessonIds: [],
            enrolledAt: todayStamp(),
          });
          pushActivity(draft, `${learner.name} enrolled in ${course.title}.`, ["admin", "instructor", "learner"], {
            learnerId: learner.id,
            instructorId: course.instructorId,
          });
        });
        toast(`Enrolled in ${course.title}`);
      },
      setLessonComplete: (courseId, lessonId, complete) => {
        const learner = sessionUser(state, "learner");
        const course = courseById(state, courseId);
        if (!learner || !course) return;
        const lesson = flatLessons(course).find((item) => item.id === lessonId);
        patch((draft) => {
          let enrollment = draft.enrollments.find((item) => item.learnerId === learner.id && item.courseId === courseId);
          if (!enrollment) return;
          const ids = new Set(enrollment.completedLessonIds);
          if (complete) ids.add(lessonId);
          else ids.delete(lessonId);
          enrollment.completedLessonIds = flatLessons(course).map((item) => item.id).filter((id) => ids.has(id));
          const view = enrollmentView(course, enrollment);
          if (view.status === "completed") enrollment.completedAt = enrollment.completedAt ?? todayStamp();
          else delete enrollment.completedAt;
          pushActivity(
            draft,
            complete
              ? `${learner.name} completed “${lesson?.title ?? "a lesson"}.”`
              : `${learner.name} reopened “${lesson?.title ?? "a lesson"}.”`,
            ["admin", "instructor", "learner"],
            { learnerId: learner.id, instructorId: course.instructorId },
          );
        });
        toast(complete ? "Lesson marked complete" : "Lesson marked incomplete");
      },
      submitQuiz: (quizId, answers) => {
        const learner = sessionUser(state, "learner");
        const quiz = state.quizzes.find((item) => item.id === quizId);
        if (!learner || !quiz) return null;
        const correct = quiz.questions.filter((question, index) => question.correctIndex === answers[index]).length;
        const score = Math.round((correct / quiz.questions.length) * 100);
        const attempt: QuizAttempt = {
          id: newId("attempt"),
          quizId,
          learnerId: learner.id,
          answers,
          score,
          submittedAt: new Date().toISOString(),
        };
        patch((draft) => {
          draft.attempts = draft.attempts.filter((item) => !(item.quizId === quizId && item.learnerId === learner.id));
          draft.attempts.push(attempt);
          const course = courseById(draft, quiz.courseId);
          const lessonId = quiz.lessonId;
          const enrollment = draft.enrollments.find((item) => item.learnerId === learner.id && item.courseId === quiz.courseId);
          if (enrollment && score >= 70 && !enrollment.completedLessonIds.includes(lessonId)) {
            enrollment.completedLessonIds.push(lessonId);
            if (course && enrollmentView(course, enrollment).status === "completed") {
              enrollment.completedAt = enrollment.completedAt ?? todayStamp();
            }
          }
          pushActivity(draft, `${learner.name} submitted ${quiz.title} (${score}%).`, ["admin", "instructor", "learner"], {
            learnerId: learner.id,
            instructorId: course?.instructorId,
          });
        });
        toast(score >= 70 ? `Checkpoint submitted · ${score}%` : `Submitted · ${score}%. You can try again.`);
        return attempt;
      },
      submitAssignment: (courseId, body) => {
        const learner = sessionUser(state, "learner");
        const course = courseById(state, courseId);
        if (!learner || !course?.assignment) return "This course has no assignment.";
        if (body.trim().length < 40) return "Write at least a short paragraph so the reviewer has something to read.";
        const existing = state.submissions.find((item) => item.learnerId === learner.id && item.courseId === courseId);
        if (existing) return "This assignment has already been submitted.";
        patch((draft) => {
          draft.submissions.unshift({
            id: newId("sub"),
            learnerId: learner.id,
            courseId,
            title: course.assignment!.title,
            body: body.trim(),
            submittedAt: new Date().toISOString(),
            status: "pending",
          });
          pushActivity(draft, `${learner.name} submitted “${course.assignment!.title}.”`, ["admin", "instructor", "learner"], {
            learnerId: learner.id,
            instructorId: course.instructorId,
          });
        });
        toast("Assignment submitted");
        return null;
      },
      reviewSubmission: (id, score, feedback) => {
        const reviewer = sessionUser(state, state.role === "learner" ? "instructor" : state.role);
        patch((draft) => {
          const submission = draft.submissions.find((item) => item.id === id);
          if (!submission) return;
          submission.status = "reviewed";
          submission.score = score;
          submission.feedback = feedback.trim();
          submission.reviewerId = reviewer?.id;
          submission.reviewedAt = new Date().toISOString();
          const learner = draft.users.find((user) => user.id === submission.learnerId);
          pushActivity(
            draft,
            `${reviewer?.name ?? "An instructor"} reviewed ${learner?.name ?? "a learner"}’s submission.`,
            ["admin", "instructor", "learner"],
            { learnerId: submission.learnerId, instructorId: reviewer?.id },
          );
        });
        toast("Feedback saved on this browser");
      },
      saveUser: (user) => {
        const email = user.email.trim().toLowerCase();
        if (state.users.some((item) => item.id !== user.id && item.email.toLowerCase() === email)) {
          toast("That email is already used in this browser", "danger");
          return;
        }
        const next = { ...user, email, name: user.name.trim() };
        authRepository.updateEmail(user.id, email);
        patch((draft) => {
          const index = draft.users.findIndex((item) => item.id === user.id);
          if (index >= 0) draft.users[index] = next;
          else draft.users.push(next);
        });
        toast(state.users.some((item) => item.id === user.id) ? "Profile updated" : "Person added");
      },
      removeUser: (id) => {
        const user = state.users.find((item) => item.id === id);
        if (!user) return "That person is not on this browser.";
        if (user.id === state.sessionUserId) return "You cannot remove the account you are signed in with.";
        if (user.role === "admin" && state.users.filter((item) => item.role === "admin").length <= 1) {
          return "Keep at least one administrator.";
        }
        authRepository.remove(id);
        patch((draft) => {
          draft.users = draft.users.filter((item) => item.id !== id);
          draft.enrollments = draft.enrollments.filter((item) => item.learnerId !== id);
          draft.submissions = draft.submissions.filter((item) => item.learnerId !== id);
          draft.attempts = draft.attempts.filter((item) => item.learnerId !== id);
          pushActivity(draft, `${user.name} was removed.`, ["admin"]);
        });
        toast("Person removed from this browser");
        return null;
      },
      setUserStatus: (id, status) => {
        patch((draft) => {
          const user = draft.users.find((item) => item.id === id);
          if (user) user.status = status;
        });
        toast(status === "active" ? "Account activated" : status === "suspended" ? "Account suspended" : "Status updated");
      },
      saveSettings: (settings) => {
        patch((draft) => { draft.settings = settings; });
        toast("Settings saved in this browser");
      },
      addCategory: (name, description) => {
        if (name.trim().length < 3) return "Give the category a name.";
        if (state.categories.some((item) => item.name.toLowerCase() === name.trim().toLowerCase())) {
          return "That category already exists.";
        }
        patch((draft) => {
          draft.categories.push({ id: newId("cat"), name: name.trim(), description: description.trim() });
        });
        toast("Category added");
        return null;
      },
      saveCategory: (id, name, description, status) => {
        if (name.trim().length < 3) return "Give the category a name.";
        const current = state.categories.find((item) => item.id === id);
        if (!current) return "Category not found.";
        if (state.categories.some((item) => item.id !== id && item.name.toLowerCase() === name.trim().toLowerCase())) {
          return "That category already exists.";
        }
        patch((draft) => {
          const category = draft.categories.find((item) => item.id === id);
          if (!category) return;
          const previous = category.name;
          category.name = name.trim();
          category.description = description.trim();
          category.status = status;
          for (const course of draft.courses) {
            if (course.category === previous) course.category = category.name;
          }
        });
        toast("Category updated");
        return null;
      },
      removeCategory: (id) => {
        const category = state.categories.find((item) => item.id === id);
        if (!category) return "Category not found.";
        if (state.courses.some((course) => course.category === category.name)) {
          return "Move or edit the courses in this category before deleting it.";
        }
        patch((draft) => {
          draft.categories = draft.categories.filter((item) => item.id !== id);
        });
        toast("Category removed");
        return null;
      },
      setTicketStatus: (id, status) => {
        patch((draft) => {
          const ticket = draft.tickets.find((item) => item.id === id);
          if (ticket) ticket.status = status;
        });
        toast("Support status updated in this browser");
      },
      saveQuiz: (input) => {
        const title = input.title.trim();
        if (title.length < 4) return "Give the assessment a title.";
        if (input.minutes < 5 || input.minutes > 180) return "Duration should be between 5 and 180 minutes.";
        const course = courseById(state, input.courseId);
        if (!course) return "Choose a course.";
        if (input.id) {
          patch((draft) => {
            const quiz = draft.quizzes.find((item) => item.id === input.id);
            if (!quiz) return;
            quiz.title = title;
            quiz.minutes = input.minutes;
          });
          toast("Assessment updated");
          return null;
        }
        const lesson = course.modules.flatMap((module) => module.lessons).find((item) => !item.quizId);
        if (!lesson) return "Add a lesson without a quiz in the course builder before creating another assessment.";
        const id = newId("quiz");
        patch((draft) => {
          const current = draft.courses.find((item) => item.id === course.id);
          const target = current?.modules.flatMap((module) => module.lessons).find((item) => item.id === lesson.id);
          if (target) {
            target.quizId = id;
            target.type = "quiz";
          }
          draft.quizzes.push({
            id,
            courseId: course.id,
            lessonId: lesson.id,
            title,
            minutes: input.minutes,
            questions: [
              {
                id: `${id}-q1`,
                prompt: "What should a learner be able to do after this check?",
                options: ["Name the decision the work supports", "Memorise the slide titles", "Skip the comparison"],
                correctIndex: 0,
                feedback: "A check is useful when it points at the decision, not the decoration.",
              },
            ],
          });
          pushActivity(draft, `${title} was added to ${course.title}.`, ["admin", "instructor"], { instructorId: course.instructorId });
        });
        toast("Assessment added in this browser");
        return null;
      },
      removeQuiz: (id) => {
        const quiz = state.quizzes.find((item) => item.id === id);
        if (!quiz) return "Assessment not found.";
        if (state.attempts.some((item) => item.quizId === id)) return "This assessment has attempts, so it stays on the record.";
        patch((draft) => {
          draft.quizzes = draft.quizzes.filter((item) => item.id !== id);
          const course = draft.courses.find((item) => item.id === quiz.courseId);
          const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.id === quiz.lessonId);
          if (lesson && lesson.quizId === id) delete lesson.quizId;
        });
        toast("Assessment removed");
        return null;
      },
      addAnnouncement: (input) => {
        const author = sessionUser(state, "admin");
        patch((draft) => {
          const id = newId("ann");
          draft.announcements.unshift({
            id,
            title: input.title.trim(),
            body: input.body.trim(),
            audience: input.audience,
            authorId: author?.id ?? state.sessionUserId ?? "admin",
            createdAt: new Date().toISOString(),
          });
          draft.notifications.unshift({
            id: newId("note"),
            title: input.title.trim(),
            body: input.body.trim().slice(0, 140),
            href: "/admin/announcements",
            createdAt: new Date().toISOString(),
            read: false,
            roles: input.audience === "instructors" ? ["admin", "instructor"] : input.audience === "learners" ? ["admin", "learner"] : ["admin", "instructor", "learner"],
          });
        });
        toast("Announcement posted");
      },
      addEvent: (input) => {
        if (input.title.trim().length < 3) return "Give the event a title.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) return "Choose a date.";
        patch((draft) => {
          draft.events.push({
            id: newId("ev"),
            date: input.date,
            title: input.title.trim(),
            kind: input.kind,
            detail: input.detail.trim(),
            courseId: input.courseId || undefined,
          });
          draft.events.sort((a, b) => a.date.localeCompare(b.date));
        });
        toast("Event added on this browser");
        return null;
      },
      createCourse: () => {
        const id = newId("c");
        const actor = sessionUser(state);
        patch((draft) => {
          if (!draft.categories.length) {
            draft.categories.push({ id: newId("cat"), name: "General", description: "", status: "active" });
          }
          draft.courses.unshift({
            id,
            title: "Untitled course",
            category: draft.categories[0]?.name ?? "General",
            level: "Beginner",
            status: "draft",
            summary: "",
            overview: "",
            outcomes: [],
            instructorId: actor?.id ?? "",
            tags: [],
            cover: "",
            coverTint: "#D8C8B8",
            updatedAt: new Date().toISOString(),
            modules: [
              {
                id: `${id}-m1`,
                title: "Module 1",
                summary: "",
                lessons: [],
              },
            ],
          });
        });
        toast("Draft saved on this browser");
        return id;
      },
      updateCourse: (courseId, recipe) => {
        patch((draft) => {
          const course = draft.courses.find((item) => item.id === courseId);
          if (!course) return;
          recipe(course, draft);
          course.updatedAt = new Date().toISOString();
        });
      },
      publishCourse: (courseId) => {
        const course = courseById(state, courseId);
        if (!course) return "Course not found.";
        if (course.title.trim().length < 4 || course.title === "Untitled course") return "Give the course a real title before publishing.";
        if (course.summary.trim().length < 12) return "Add a short summary.";
        const lessonCount = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
        if (lessonCount < 1) return "Add at least one lesson.";
        const actor = sessionUser(state);
        if (!actor) return "Sign in to continue.";
        if (actor.role === "instructor") {
          if (course.status === "in_review") return "This course is already waiting for approval.";
          patch((draft) => {
            const current = draft.courses.find((item) => item.id === courseId);
            if (!current) return;
            current.status = "in_review";
            current.updatedAt = new Date().toISOString();
            pushActivity(draft, `${current.title} was submitted for approval.`, ["admin", "instructor"], { instructorId: current.instructorId });
          });
          toast("Submitted for approval");
          return null;
        }
        patch((draft) => {
          const current = draft.courses.find((item) => item.id === courseId);
          if (!current) return;
          current.status = "published";
          current.publishedAt = current.publishedAt ?? todayStamp();
          current.updatedAt = new Date().toISOString();
          pushActivity(draft, `${current.title} was published.`, ["admin", "instructor"], { instructorId: current.instructorId });
        });
        toast("Course published");
        return null;
      },
      unpublishCourse: (courseId) => {
        patch((draft) => {
          const course = draft.courses.find((item) => item.id === courseId);
          if (course) course.status = "draft";
        });
        toast("Course moved back to draft");
      },
      discardDraft: (courseId) => {
        const course = courseById(state, courseId);
        if (!course || course.status !== "draft") return;
        patch((draft) => {
          draft.courses = draft.courses.filter((item) => item.id !== courseId);
        });
        toast("Draft discarded");
      },
    };
  }, [hydrated, state, toasts]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
