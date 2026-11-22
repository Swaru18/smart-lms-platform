import type { Announcement, CalendarEvent, Category, Course, DemoState, Quiz, User } from "./types";

export const SAMPLE_INSTRUCTOR_ID = "sample-faculty";

const instructor: User = {
  id: SAMPLE_INSTRUCTOR_ID,
  name: "Sample Faculty",
  email: "faculty.sample@smartlms.local",
  role: "instructor",
  status: "active",
  title: "Sample instructor",
  lastActive: "2026-11-22",
  bio: "Sample profile attached to the starter catalogue. This is not a sign-in account.",
  color: "#E3D4C4",
};

function lesson(id: string, title: string, minutes: number, summary: string, body: string, extra?: { type?: Course["modules"][number]["lessons"][number]["type"]; quizId?: string; resourceName?: string }) {
  return {
    id,
    title,
    type: extra?.type ?? "text",
    minutes,
    summary,
    body,
    quizId: extra?.quizId,
    resourceName: extra?.resourceName,
  };
}

const courses: Course[] = [
  {
    id: "sample-writing",
    sample: true,
    title: "Clear workplace writing",
    category: "Communication",
    level: "Beginner",
    status: "published",
    summary: "Write a short brief that a colleague can act on.",
    overview: "Three lessons on audience, structure and a final brief.",
    outcomes: ["Name the reader and the decision.", "Cut a draft to one page.", "Mark the sentence a colleague should act on."],
    instructorId: SAMPLE_INSTRUCTOR_ID,
    tags: ["writing", "sample"],
    cover: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&h=788&q=80",
    coverTint: "#E3D4C4",
    publishedAt: "2026-11-01",
    updatedAt: "2026-11-18",
    assignment: {
      title: "One-page brief",
      prompt: "Write a one-page brief for a decision your team actually faces. Name the reader, the choice, and the sentence they should act on.",
      due: "2026-12-04",
    },
    modules: [
      {
        id: "sample-writing-m1",
        title: "The reader",
        summary: "Decide who the page is for before you draft.",
        lessons: [
          lesson("sample-writing-l1", "Name the decision", 12, "Start from the choice, not the topic.", "Write the decision in one sentence. If you cannot, the page is still a topic list."),
          lesson("sample-writing-l2", "Cut the first draft", 15, "Keep the sentence the reader needs.", "Read the draft aloud and delete any sentence that does not change the decision."),
        ],
      },
      {
        id: "sample-writing-m2",
        title: "The check",
        summary: "A short quiz, then the brief.",
        lessons: [
          lesson("sample-writing-l3", "Brief checkpoint", 8, "Check the reader, the choice and the action.", "Answer the three questions, then write the assignment.", { type: "quiz", quizId: "sample-quiz-writing" }),
        ],
      },
    ],
  },
  {
    id: "sample-data",
    sample: true,
    title: "Evidence before charts",
    category: "Data",
    level: "Intermediate",
    status: "published",
    summary: "Put the comparison and its limit next to the number.",
    overview: "Practice naming the pool, the comparison and the caveat.",
    outcomes: ["State the comparison in the title.", "Name what the number does not include.", "Choose a chart only after the sentence is clear."],
    instructorId: SAMPLE_INSTRUCTOR_ID,
    tags: ["data", "sample"],
    cover: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&h=788&q=80",
    coverTint: "#EEE5DA",
    publishedAt: "2026-11-02",
    updatedAt: "2026-11-18",
    assignment: {
      title: "Retitle a chart",
      prompt: "Take a chart you already use. Rewrite the title so it states the comparison and one limit. Paste the old title and the new one.",
      due: "2026-12-11",
    },
    modules: [
      {
        id: "sample-data-m1",
        title: "The comparison",
        summary: "A number without a comparison is not a finding.",
        lessons: [
          lesson("sample-data-l1", "What changed", 14, "Name the two groups you are comparing.", "Write both groups in the title. If one group is missing, the chart is still a picture."),
          lesson("sample-data-l2", "What the pool excludes", 12, "Say who is not in the count.", "Add one clause for the people, weeks or sites the number leaves out."),
        ],
      },
      {
        id: "sample-data-m2",
        title: "Check the claim",
        summary: "A short assessment on the comparison.",
        lessons: [
          lesson("sample-data-l3", "Comparison checkpoint", 10, "Three questions on titles and limits.", "Submit the checkpoint before the chart assignment.", { type: "quiz", quizId: "sample-quiz-data" }),
        ],
      },
    ],
  },
  {
    id: "sample-design",
    sample: true,
    title: "Designing a short course",
    category: "Learning design",
    level: "Intermediate",
    status: "published",
    summary: "One outcome, one practice, one check.",
    overview: "Build a course outline a learner can finish in a sitting.",
    outcomes: ["Write one outcome a learner can demonstrate.", "Pair it with a practice, not a topic list.", "Add one check that matches the practice."],
    instructorId: SAMPLE_INSTRUCTOR_ID,
    tags: ["design", "sample"],
    cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1400&h=788&q=80",
    coverTint: "#E3D4C4",
    publishedAt: "2026-11-03",
    updatedAt: "2026-11-18",
    assignment: {
      title: "Three-line outline",
      prompt: "Draft one outcome, one practice and one check for a course you might teach. Keep each line under 20 words.",
      due: "2026-12-18",
    },
    modules: [
      {
        id: "sample-design-m1",
        title: "The outcome",
        summary: "Start from what the learner will do.",
        lessons: [
          lesson("sample-design-l1", "A verb, not a topic", 10, "Outcomes name an action.", "Replace topic nouns with a verb the learner can show someone else."),
          lesson("sample-design-l2", "Practice beside the outcome", 12, "The lesson is the practice.", "If the lesson is only an explanation, add the task the learner completes."),
        ],
      },
    ],
  },
  {
    id: "sample-session",
    sample: true,
    title: "Running a mixed room",
    category: "Facilitation",
    level: "Advanced",
    status: "published",
    summary: "Plan a 45-minute session for people in the room and on the call.",
    overview: "Count both groups before you design the activity.",
    outcomes: ["Count who is remote before you plan.", "Give the remote group a visible role.", "End with one decision, not a recap."],
    instructorId: SAMPLE_INSTRUCTOR_ID,
    tags: ["facilitation", "sample"],
    cover: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&h=788&q=80",
    coverTint: "#EEE5DA",
    publishedAt: "2026-11-04",
    updatedAt: "2026-11-18",
    modules: [
      {
        id: "sample-session-m1",
        title: "The room you have",
        summary: "Design for the people who will actually attend.",
        lessons: [
          lesson("sample-session-l1", "Count both groups", 11, "Remote and in-room are different constraints.", "Write the two counts before you choose an activity."),
          lesson("sample-session-l2", "A visible role for the call", 13, "Silence is often a design problem.", "Give the remote group one task the room can see.", { type: "resource", resourceName: "Session checklist" }),
          lesson("sample-session-l3", "Session checkpoint", 8, "Check the plan before you book the room.", "Three questions on counts, roles and the closing decision.", { type: "quiz", quizId: "sample-quiz-session" }),
        ],
      },
    ],
  },
];

const quizzes: Quiz[] = [
  {
    id: "sample-quiz-writing",
    courseId: "sample-writing",
    lessonId: "sample-writing-l3",
    title: "Brief checkpoint",
    minutes: 8,
    questions: [
      { id: "qw1", prompt: "What belongs in the first sentence?", options: ["The decision the reader must make", "A history of the team", "Every source you read", "The file name"], correctIndex: 0, feedback: "The reader needs the decision before the background." },
      { id: "qw2", prompt: "Which sentence should you cut?", options: ["One that does not change the decision", "The sentence that names the reader", "The action you want", "The due date"], correctIndex: 0, feedback: "Keep the lines that change what someone does next." },
      { id: "qw3", prompt: "A useful brief ends with", options: ["The action and who owns it", "A list of topics", "Three slogans", "An unread appendix"], correctIndex: 0, feedback: "Name the action and the owner." },
    ],
  },
  {
    id: "sample-quiz-data",
    courseId: "sample-data",
    lessonId: "sample-data-l3",
    title: "Comparison checkpoint",
    minutes: 10,
    questions: [
      { id: "qd1", prompt: "A chart title should state", options: ["The comparison", "The software used", "The colour palette", "The meeting name"], correctIndex: 0, feedback: "The title is the claim, not the decoration." },
      { id: "qd2", prompt: "A doubled count is misleading when", options: ["The pool of people also changed", "The font is small", "The chart is a bar", "The week had a Monday"], correctIndex: 0, feedback: "Say whether the pool changed." },
      { id: "qd3", prompt: "Put the limit", options: ["Next to the number", "Only in an appendix", "In a later email", "In the file name"], correctIndex: 0, feedback: "The caveat belongs where the number is read." },
    ],
  },
  {
    id: "sample-quiz-session",
    courseId: "sample-session",
    lessonId: "sample-session-l3",
    title: "Session checkpoint",
    minutes: 8,
    questions: [
      { id: "qs1", prompt: "Before choosing an activity, count", options: ["People in the room and on the call", "Only the people you can see", "The slides", "The previous session"], correctIndex: 0, feedback: "Both groups change the design." },
      { id: "qs2", prompt: "A remote participant needs", options: ["A task the room can see", "A longer introduction", "More slides", "A separate document they never share"], correctIndex: 0, feedback: "Give the call a visible role." },
      { id: "qs3", prompt: "Close the session with", options: ["One decision", "A full recap of every comment", "A new topic", "An unread chat"], correctIndex: 0, feedback: "End on the decision, not a summary of the hour." },
    ],
  },
];

const categories: Category[] = [
  { id: "cat-communication", name: "Communication", description: "Writing and briefs.", status: "active" },
  { id: "cat-data", name: "Data", description: "Comparisons and charts.", status: "active" },
  { id: "cat-design", name: "Learning design", description: "Short courses and outcomes.", status: "active" },
  { id: "cat-facilitation", name: "Facilitation", description: "Rooms and live sessions.", status: "active" },
];

const events: CalendarEvent[] = [
  { id: "sample-ev-1", date: "2026-11-27", title: "Live session: mixed rooms", kind: "session", courseId: "sample-session", detail: "Sample session. 45 minutes. Count both groups before you join." },
  { id: "sample-ev-2", date: "2026-12-02", title: "Brief checkpoint", kind: "assessment", courseId: "sample-writing", detail: "Sample assessment on Clear workplace writing." },
  { id: "sample-ev-3", date: "2026-12-04", title: "One-page brief due", kind: "deadline", courseId: "sample-writing", detail: "Sample assignment deadline." },
  { id: "sample-ev-4", date: "2026-12-09", title: "Comparison checkpoint", kind: "assessment", courseId: "sample-data", detail: "Sample assessment on Evidence before charts." },
  { id: "sample-ev-5", date: "2026-12-11", title: "Retitle a chart due", kind: "deadline", courseId: "sample-data", detail: "Sample assignment deadline." },
  { id: "sample-ev-6", date: "2026-12-16", title: "Course studio hour", kind: "session", courseId: "sample-design", detail: "Sample working session for Designing a short course." },
  { id: "sample-ev-7", date: "2026-12-18", title: "Three-line outline due", kind: "deadline", courseId: "sample-design", detail: "Sample assignment deadline." },
];

const announcements: Announcement[] = [
  {
    id: "sample-ann-1",
    title: "Starter catalogue is available",
    body: "Four sample courses are published so you can explore lessons, assessments and dates. They are sample material, not records of real learners.",
    audience: "everyone",
    authorId: SAMPLE_INSTRUCTOR_ID,
    createdAt: "2026-11-20T09:00:00.000Z",
  },
];

export function applySampleCatalogue(state: DemoState): DemoState {
  if (state.courses.length > 0) return state;
  const users = state.users.some((user) => user.id === SAMPLE_INSTRUCTOR_ID) ? state.users : [...state.users, instructor];
  return {
    ...state,
    users,
    categories: state.categories.length ? state.categories : categories,
    courses,
    quizzes: [...quizzes, ...state.quizzes.filter((quiz) => !quizzes.some((item) => item.id === quiz.id))],
    events: state.events.length ? state.events : events,
    announcements: state.announcements.length ? state.announcements : announcements,
    notifications: state.notifications.length ? state.notifications : [
      {
        id: "sample-note-1",
        title: "Starter catalogue",
        body: "Sample courses, assessments and dates are ready to explore. Enroll to track your own progress.",
        href: "/learn/catalogue",
        createdAt: "2026-11-20T09:00:00.000Z",
        read: false,
        roles: ["learner", "instructor", "admin"],
      },
    ],
  };
}
