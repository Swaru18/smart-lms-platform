import { applySampleCatalogue } from "./sample-catalogue";
import type { DemoState } from "./types";

/** Workspace plus the starter catalogue. Personal enrollments are not invented. */
export function createInitialState(): DemoState {
  return applySampleCatalogue({
    version: 2,
    theme: "light",
    role: "learner",
    sessionUserId: null,
    sidebarCollapsed: false,
    settings: {
      name: "Smart LMS",
      shortName: "Smart LMS",
      timezone: "UTC",
      weekStartsOn: "mon",
      supportNote: "Messages stay in this browser until email is connected.",
    },
    categories: [],
    users: [],
    courses: [],
    enrollments: [],
    quizzes: [],
    attempts: [],
    submissions: [],
    announcements: [],
    events: [],
    notifications: [],
    activity: [],
    tickets: [],
    reviewSnapshot: { asOf: "", pending: 0 },
    learnerSnapshot: { asOf: "", active: 0 },
  });
}
