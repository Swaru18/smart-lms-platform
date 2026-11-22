/**
 * Service boundaries for Phase 2.
 * The current app implements these operations in the browser.
 * A Supabase adapter should satisfy the same inputs and outputs
 * without changing page components.
 */

export type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export type AuthService = {
  signUp(input: { name: string; email: string; password: string; role: "learner" | "instructor" }): Promise<ServiceResult<{ userId: string; status: "active" | "invited" }>>;
  signIn(input: { email: string; password: string; remember: boolean }): Promise<ServiceResult<{ userId: string }>>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<ServiceResult<{ delivered: boolean }>>;
};

export type UserService = {
  list(): Promise<ServiceResult<unknown[]>>;
  save(user: unknown): Promise<ServiceResult<unknown>>;
  setStatus(id: string, status: string): Promise<ServiceResult<null>>;
};

export type CourseService = {
  list(): Promise<ServiceResult<unknown[]>>;
  save(course: unknown): Promise<ServiceResult<unknown>>;
  submitForApproval(id: string): Promise<ServiceResult<null>>;
  publish(id: string): Promise<ServiceResult<null>>;
};

export type EnrollmentService = {
  enroll(courseId: string): Promise<ServiceResult<unknown>>;
  setLessonComplete(courseId: string, lessonId: string, complete: boolean): Promise<ServiceResult<null>>;
};

export type AssignmentService = {
  submit(courseId: string, body: string): Promise<ServiceResult<null>>;
  review(id: string, score: number, feedback: string): Promise<ServiceResult<null>>;
};

export type AssessmentService = {
  save(input: unknown): Promise<ServiceResult<null>>;
  submitAttempt(quizId: string, answers: number[]): Promise<ServiceResult<unknown>>;
};

export type NotificationService = {
  list(): Promise<ServiceResult<unknown[]>>;
  markRead(id: string, read: boolean): Promise<ServiceResult<null>>;
};
