# Phase 2 — Supabase

Phase 1.5 is still frontend-only. Accounts, courses and progress live in this browser. Passwords are salted and hashed with SHA-256 in `lib/services/password.ts`. That is a prototype measure, not production authentication, and it does not sync across devices or browsers.

UI reads and writes through `lib/store.tsx`. Credentials go through `lib/services/auth-repository.ts`. Contact notes go through `lib/services/local-notes.ts`. Page components do not read `localStorage` directly. `lib/services/contracts.ts` names the service shapes a Supabase adapter should satisfy.

Replace the local adapters. Do not redraw the screens.

## Planned Supabase mapping

- **Authentication.** Supabase Auth replaces local sign-up, sign-in, remember-me and password reset. Email delivery starts here. Remove the local hash.
- **User profiles.** `users` table keyed to `auth.users`, with name, role, status, title, bio and avatar path.
- **Role management.** Roles live in the profile, not in a public form. Public registration may create students. Instructor rows stay `invited` until an admin updates them. Admin rows are created by a privileged function, not by the public form. The current `/setup` screen is only for the empty browser.
- **Courses, modules and lessons.** Tables for courses, modules and lessons. Draft, `in_review` and published stay as a status column. Instructors submit; admins publish.
- **Enrollments.** One row per student and course, with completed lesson ids or a lesson-progress table.
- **Assignments and submissions.** Assignment on the course, submission rows with score and feedback.
- **Assessments.** Quizzes, questions and attempts.
- **Certificates.** Issued when an enrollment is complete. Storage holds the file. The current preview is not a credential.
- **Notifications.** Rows scoped by role and user.
- **File storage.** Thumbnails, lesson files and certificate assets in Supabase Storage. The current thumbnail is a URL or a data URL in the browser.
- **Row Level Security.** A student reads their own enrollment and submissions. An instructor reads courses they own and submissions on those courses. An admin reads the organization. Publishing, inviting and issuing certificates run with a privileged check, not with a role flag sent from the browser.

Do not add a second backend for auth, storage or row-level access unless a provider or scheduled job needs it. Payments are out of scope until pricing exists.
