export type Role = "admin" | "instructor" | "learner";
export type ThemeMode = "dark" | "light";
export type Engagement = "active" | "at_risk" | "inactive" | "completed";
export type UserStatus = "active" | "invited" | "suspended";
export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";
export type CourseStatus = "draft" | "in_review" | "published";
export type LessonType = "text" | "video" | "resource" | "quiz";
export type SubmissionStatus = "pending" | "reviewed";
export type EventKind = "assessment" | "deadline" | "session";
export type Audience = "everyone" | "learners" | "instructors";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  title: string;
  engagement?: Engagement;
  lastActive: string;
  bio: string;
  color: string;
  avatar?: string;
};

export type Lesson = {
  id: string;
  title: string;
  type: LessonType;
  minutes: number;
  summary: string;
  body: string;
  resourceName?: string;
  quizId?: string;
};

export type Module = {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export type CourseAssignment = {
  title: string;
  prompt: string;
  due: string;
};

export type Course = {
  id: string;
  title: string;
  category: string;
  level: CourseLevel;
  status: CourseStatus;
  summary: string;
  overview: string;
  outcomes: string[];
  instructorId: string;
  tags: string[];
  cover: string;
  coverTint: string;
  publishedAt?: string;
  updatedAt: string;
  assignment?: CourseAssignment;
  modules: Module[];
  sample?: boolean;
};

export type Enrollment = {
  id: string;
  learnerId: string;
  courseId: string;
  completedLessonIds: string[];
  enrolledAt: string;
  completedAt?: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  feedback: string;
};

export type Quiz = {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  minutes: number;
  questions: QuizQuestion[];
};

export type QuizAttempt = {
  id: string;
  quizId: string;
  learnerId: string;
  answers: number[];
  score: number;
  submittedAt: string;
};

export type Submission = {
  id: string;
  learnerId: string;
  courseId: string;
  title: string;
  body: string;
  submittedAt: string;
  status: SubmissionStatus;
  score?: number;
  feedback?: string;
  reviewerId?: string;
  reviewedAt?: string;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: Audience;
  authorId: string;
  createdAt: string;
};

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  kind: EventKind;
  courseId?: string;
  detail: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
  roles: Role[];
};

export type ActivityItem = {
  id: string;
  at: string;
  text: string;
  roles: Role[];
  learnerId?: string;
  instructorId?: string;
};

export type CategoryStatus = "active" | "archived";

export type Category = {
  id: string;
  name: string;
  description: string;
  status?: CategoryStatus;
};

export type TicketStatus = "open" | "in_progress" | "closed";

export type Ticket = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  priority: "low" | "normal" | "high";
  status: TicketStatus;
};

export type OrgSettings = {
  name: string;
  shortName: string;
  timezone: string;
  weekStartsOn: "mon" | "sun";
  supportNote: string;
};

export type DemoState = {
  version: 2;
  theme: ThemeMode;
  role: Role;
  sessionUserId: string | null;
  sidebarCollapsed: boolean;
  settings: OrgSettings;
  categories: Category[];
  users: User[];
  courses: Course[];
  enrollments: Enrollment[];
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  submissions: Submission[];
  announcements: Announcement[];
  events: CalendarEvent[];
  notifications: NotificationItem[];
  activity: ActivityItem[];
  tickets: Ticket[];
  reviewSnapshot: { asOf: string; pending: number };
  learnerSnapshot: { asOf: string; active: number };
};

export const DEMO_TODAY = "2026-11-19";
export const STATE_VERSION = 2;
