/** Historical sample builder. The app does not import this module. */
import type { Course, DemoState, Enrollment } from "../types";
import { courses } from "./courses";
import { quizzes } from "./quizzes";
import { users } from "./people";

type SeedEnrollment = {
  learnerId: string;
  courseId: string;
  done: number | "all";
  enrolledAt: string;
  completedAt?: string;
};

const enrollmentSeeds: SeedEnrollment[] = [
  { learnerId: "maya", courseId: "c-evidence", done: 3, enrolledAt: "2026-09-10" },
  { learnerId: "omar", courseId: "c-evidence", done: 4, enrolledAt: "2026-08-10" },
  { learnerId: "noah", courseId: "c-evidence", done: 2, enrolledAt: "2026-07-10" },
  { learnerId: "james", courseId: "c-evidence", done: 1, enrolledAt: "2026-10-24" },
  { learnerId: "chloe", courseId: "c-evidence", done: 3, enrolledAt: "2026-10-10" },
  { learnerId: "fatima", courseId: "c-evidence", done: 4, enrolledAt: "2026-11-06" },
  { learnerId: "hannah", courseId: "c-evidence", done: "all", enrolledAt: "2026-06-10", completedAt: "2026-10-12" },
  { learnerId: "rowan", courseId: "c-evidence", done: "all", enrolledAt: "2026-06-10", completedAt: "2026-09-18" },

  { learnerId: "maya", courseId: "c-hybrid", done: 2, enrolledAt: "2026-10-10" },
  { learnerId: "aisha", courseId: "c-hybrid", done: "all", enrolledAt: "2026-08-10", completedAt: "2026-11-08" },
  { learnerId: "luca", courseId: "c-hybrid", done: 2, enrolledAt: "2026-09-10" },
  { learnerId: "meera", courseId: "c-hybrid", done: 3, enrolledAt: "2026-07-10" },
  { learnerId: "chloe", courseId: "c-hybrid", done: 1, enrolledAt: "2026-11-04" },
  { learnerId: "hannah", courseId: "c-hybrid", done: "all", enrolledAt: "2026-06-10", completedAt: "2026-08-21" },
  { learnerId: "elliot", courseId: "c-hybrid", done: 0, enrolledAt: "2026-10-22" },

  { learnerId: "meera", courseId: "c-design", done: 2, enrolledAt: "2026-08-10" },
  { learnerId: "hannah", courseId: "c-design", done: "all", enrolledAt: "2026-06-10", completedAt: "2026-07-16" },
  { learnerId: "rowan", courseId: "c-design", done: "all", enrolledAt: "2026-07-10", completedAt: "2026-10-09" },
  { learnerId: "isabel", courseId: "c-design", done: 3, enrolledAt: "2026-09-10" },
  { learnerId: "fatima", courseId: "c-design", done: 2, enrolledAt: "2026-10-10" },
  { learnerId: "daniel", courseId: "c-design", done: 0, enrolledAt: "2026-07-10" },

  { learnerId: "maya", courseId: "c-writing", done: 0, enrolledAt: "2026-11-11" },
  { learnerId: "sofia", courseId: "c-writing", done: 2, enrolledAt: "2026-09-10" },
  { learnerId: "aisha", courseId: "c-writing", done: 3, enrolledAt: "2026-10-24" },
  { learnerId: "rowan", courseId: "c-writing", done: "all", enrolledAt: "2026-09-10", completedAt: "2026-11-02" },
  { learnerId: "luca", courseId: "c-writing", done: 2, enrolledAt: "2026-08-10" },
  { learnerId: "omar", courseId: "c-writing", done: 1, enrolledAt: "2026-11-07" },

  { learnerId: "meera", courseId: "c-rubrics", done: 1, enrolledAt: "2026-10-10" },
  { learnerId: "isabel", courseId: "c-rubrics", done: 2, enrolledAt: "2026-11-05" },
  { learnerId: "rowan", courseId: "c-rubrics", done: "all", enrolledAt: "2026-08-10", completedAt: "2026-10-28" },
  { learnerId: "aisha", courseId: "c-rubrics", done: 2, enrolledAt: "2026-09-10" },

  { learnerId: "noah", courseId: "c-models", done: 2, enrolledAt: "2026-08-10" },
  { learnerId: "sofia", courseId: "c-models", done: "all", enrolledAt: "2026-07-10", completedAt: "2026-09-25" },
  { learnerId: "omar", courseId: "c-models", done: 3, enrolledAt: "2026-10-10" },
  { learnerId: "james", courseId: "c-models", done: 1, enrolledAt: "2026-09-10" },
  { learnerId: "elliot", courseId: "c-models", done: 0, enrolledAt: "2026-10-08" },
  { learnerId: "daniel", courseId: "c-models", done: 0, enrolledAt: "2026-06-10" },
  { learnerId: "fatima", courseId: "c-models", done: 2, enrolledAt: "2026-10-27" },
  { learnerId: "chloe", courseId: "c-models", done: "all", enrolledAt: "2026-09-10", completedAt: "2026-11-12" },

  { learnerId: "luca", courseId: "c-visual", done: "all", enrolledAt: "2026-07-10", completedAt: "2026-11-09" },
  { learnerId: "kenji", courseId: "c-visual", done: 1, enrolledAt: "2026-08-12" },
  { learnerId: "isabel", courseId: "c-visual", done: 2, enrolledAt: "2026-11-03" },
  { learnerId: "meera", courseId: "c-visual", done: 2, enrolledAt: "2026-11-14" },
  { learnerId: "fatima", courseId: "c-visual", done: 3, enrolledAt: "2026-11-10" },
];

function lessonIds(course: Course) {
  return course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
}

function toEnrollment(seed: SeedEnrollment, course: Course): Enrollment {
  const ids = lessonIds(course);
  const count = seed.done === "all" ? ids.length : seed.done;
  return {
    id: `${seed.learnerId}-${seed.courseId}`,
    learnerId: seed.learnerId,
    courseId: seed.courseId,
    completedLessonIds: ids.slice(0, count),
    enrolledAt: seed.enrolledAt,
    completedAt: seed.completedAt,
  };
}

export function createSeed(): DemoState {
  const courseMap = new Map(courses.map((course) => [course.id, course]));
  const enrollments = enrollmentSeeds.map((seed) => {
    const course = courseMap.get(seed.courseId);
    if (!course) throw new Error(`Missing course ${seed.courseId}`);
    return toEnrollment(seed, course);
  });

  const state: DemoState = {
    version: 2,
    theme: "light",
    role: "admin",
    sessionUserId: null,
    sidebarCollapsed: false,
    settings: {
      name: "Smart LMS",
      shortName: "Smart LMS",
      timezone: "UTC",
      weekStartsOn: "mon",
      supportNote: "Messages stay in this browser. Nothing is emailed.",
    },
    categories: [
      {
        id: "cat-data",
        name: "Data & Analytics",
        description: "Decisions, models and visuals that a colleague can audit.",
      },
      {
        id: "cat-practice",
        name: "Professional Practice",
        description: "Facilitation, writing and conversations at work.",
      },
      {
        id: "cat-design",
        name: "Learning Design",
        description: "Short courses, outcomes and rubrics.",
      },
    ],
    users,
    courses,
    enrollments,
    quizzes,
    attempts: [],
    submissions: [
      {
        id: "sub-maya-evidence",
        learnerId: "maya",
        courseId: "c-evidence",
        title: "Name the bias in this chart",
        body: "Our weekly chart says tickets doubled after the new form. The eligible group also grew, from the east queue only to east and north. I have the counts but not the rates on the chart. The decision it is being used for is whether to add a Tuesday person. I think the caveat — the pool changed — has to sit in the title, not in a footnote.",
        submittedAt: "2026-11-16",
        status: "pending",
      },
      {
        id: "sub-noah-models",
        learnerId: "noah",
        courseId: "c-models",
        title: "Quarterly forecast workbook",
        body: "Decision: do we add a Tuesday shift in April? Assumptions: 18 calls an hour, 6 hours of coverage, 8% growth from the January source file. Output sentence: at 18 calls the queue clears; at 22 it does not. I have not labeled the cell a colleague would edit.",
        submittedAt: "2026-11-02",
        status: "pending",
      },
      {
        id: "sub-james-evidence",
        learnerId: "james",
        courseId: "c-evidence",
        title: "Name the bias in this chart",
        body: "The pipeline chart compares this week with our best week in March and does not say so. March had a launch. I would retitle it and show the previous four weeks. The decision on the table is whether to keep the outbound script.",
        submittedAt: "2026-10-30",
        status: "pending",
      },
      {
        id: "sub-kenji-visual",
        learnerId: "kenji",
        courseId: "c-visual",
        title: "One-page visual argument",
        body: "Claim: repeat calls fell after the Tuesday shift. I still have two charts on the page and a legend with six colors. I know the second chart has to go. The annotation I want is on the week the shift started.",
        submittedAt: "2026-11-01",
        status: "pending",
      },
      {
        id: "sub-chloe-hybrid",
        learnerId: "chloe",
        courseId: "c-hybrid",
        title: "Draft a 45-minute session plan",
        body: "Outcome: each participant leaves with the first four lines of a status update rewritten. Eight people remote, three in the room. Priya watches the remote room. Practice is 25 minutes on one paragraph. I cut the second framework.",
        submittedAt: "2026-11-15",
        status: "pending",
      },
      {
        id: "sub-omar-evidence",
        learnerId: "omar",
        courseId: "c-evidence",
        title: "Name the bias in this chart",
        body: "The renewal chart used counts while the book of business grew. I rewrote the claim as a rate and put the acquisition note in the same sentence.",
        submittedAt: "2026-10-20",
        status: "reviewed",
        score: 86,
        feedback:
          "The rate is the right comparison. Next pass: say which decision changes if the rate is flat rather than down.",
        reviewerId: "jonah",
        reviewedAt: "2026-10-22",
      },
      {
        id: "sub-sofia-models",
        learnerId: "sofia",
        courseId: "c-models",
        title: "Quarterly forecast workbook",
        body: "One sheet for the April close. Inputs are named, sourced, and dated. The sentence at the bottom says we do not add the shift unless calls per hour hold above 20.",
        submittedAt: "2026-09-20",
        status: "reviewed",
        score: 91,
        feedback: "Clear decision and a visible sensitivity. The handoff note is something a colleague can use without you.",
        reviewerId: "jonah",
        reviewedAt: "2026-09-24",
      },
      {
        id: "sub-luca-visual",
        learnerId: "luca",
        courseId: "c-visual",
        title: "One-page visual argument",
        body: "One line, two labels, title states the claim. I removed the second chart and the icon row.",
        submittedAt: "2026-11-06",
        status: "reviewed",
        score: 88,
        feedback: "The ten-second reading matches the title. Keep the holiday annotation in the same ink as the label, not as a footnote.",
        reviewerId: "jonah",
        reviewedAt: "2026-11-09",
      },
      {
        id: "sub-aisha-hybrid",
        learnerId: "aisha",
        courseId: "c-hybrid",
        title: "Draft a 45-minute session plan",
        body: "Plan for a hybrid retro. Outcome, timing and a named remote watcher are on the page. I still had a second exercise and deleted it after the lab.",
        submittedAt: "2026-11-05",
        status: "reviewed",
        score: 78,
        feedback:
          "The arc is right. Make the participation rule a sentence you will actually say, not a bullet called “engagement.”",
        reviewerId: "lena",
        reviewedAt: "2026-11-07",
      },
      {
        id: "sub-hannah-design",
        learnerId: "hannah",
        courseId: "c-design",
        title: "Outline a short module",
        body: "One module on writing a handoff. Outcome is observable. Three activities, a check, and a note on what to cut if the room runs long.",
        submittedAt: "2026-07-12",
        status: "reviewed",
        score: 94,
        feedback: "Another instructor could teach this. The check quotes the work instead of scoring effort.",
        reviewerId: "priya",
        reviewedAt: "2026-07-16",
      },
    ],
    announcements: [
      {
        id: "ann-rate",
        title: "How completion rate is counted here",
        body: "Completion rate is completed enrollments divided by all enrollments. It is not a headcount of people. A learner in three courses counts three times. The reporting date for this demo is 19 November 2026.",
        audience: "everyone",
        authorId: "amira",
        createdAt: "2026-11-11",
      },
      {
        id: "ann-checkpoint",
        title: "Evidence checkpoint is on 20 November",
        body: "If you are in Evidence Before Charts, the short checkpoint is on the calendar for 20 November. Finish “Spotting a biased comparison” first if you have not already. This note was not emailed.",
        audience: "learners",
        authorId: "jonah",
        createdAt: "2026-11-17",
      },
      {
        id: "ann-lab",
        title: "Hybrid lab on 24 November",
        body: "Bring a 45-minute plan with one outcome. The lab is a calendar item in this demo, not a live room.",
        audience: "learners",
        authorId: "lena",
        createdAt: "2026-11-18",
      },
    ],
    events: [
      {
        id: "ev-office",
        date: "2026-11-04",
        title: "Data office hours",
        kind: "session",
        courseId: "c-evidence",
        detail: "Bring a chart you do not trust yet. Demo agenda only.",
      },
      {
        id: "ev-writing-studio",
        date: "2026-11-12",
        title: "Writing studio",
        kind: "session",
        courseId: "c-writing",
        detail: "Practice cutting the warm-up from a status update.",
      },
      {
        id: "ev-outline",
        date: "2026-11-18",
        title: "Module outline due",
        kind: "deadline",
        courseId: "c-design",
        detail: "One module, with an observable outcome and a check.",
      },
      {
        id: "ev-checkpoint",
        date: "2026-11-20",
        title: "Evidence checkpoint",
        kind: "assessment",
        courseId: "c-evidence",
        detail: "Short quiz on comparisons, axes and caveats.",
      },
      {
        id: "ev-forecast",
        date: "2026-11-21",
        title: "Forecast workbook due",
        kind: "deadline",
        courseId: "c-models",
        detail: "A one-sheet model with named assumptions.",
      },
      {
        id: "ev-lab",
        date: "2026-11-24",
        title: "Hybrid facilitation lab",
        kind: "session",
        courseId: "c-hybrid",
        detail: "Practice opening a mixed in-room and remote group.",
      },
      {
        id: "ev-clarity",
        date: "2026-11-26",
        title: "Clarity review",
        kind: "assessment",
        courseId: "c-writing",
        detail: "Quiz, plus the muddy-paragraph rewrite if you are enrolled.",
      },
      {
        id: "ev-visual",
        date: "2026-12-02",
        title: "Visual argument due",
        kind: "deadline",
        courseId: "c-visual",
        detail: "One page, one claim, annotated.",
      },
      {
        id: "ev-rubric",
        date: "2026-12-04",
        title: "Rubric calibration",
        kind: "session",
        courseId: "c-rubrics",
        detail: "Score the same sample and compare levels.",
      },
    ],
    notifications: [
      {
        id: "note-reviews",
        title: "Reviews are waiting",
        body: "Four submissions on your courses still need a score.",
        href: "/teach/reviews",
        createdAt: "2026-11-18",
        read: false,
        roles: ["instructor"],
      },
      {
        id: "note-published",
        title: "Show the Point Visually is published",
        body: "Jonah published it on 3 November. It is the newest active course.",
        href: "/admin/courses",
        createdAt: "2026-11-03",
        read: false,
        roles: ["admin"],
      },
      {
        id: "note-checkpoint",
        title: "Checkpoint on 20 November",
        body: "Evidence Before Charts has a short quiz on the calendar.",
        href: "/learn/assessments/q-evidence",
        createdAt: "2026-11-17",
        read: false,
        roles: ["learner"],
      },
      {
        id: "note-announce",
        title: "New note from Amira",
        body: "Completion rate counts enrollments, not people.",
        href: "/admin/announcements",
        createdAt: "2026-11-11",
        read: true,
        roles: ["admin", "instructor"],
      },
    ],
    activity: [
      { id: "act-1", at: "2026-11-19", text: "Fatima El-Sayed completed a lesson in Show the Point Visually.", roles: ["admin", "instructor"], instructorId: "jonah" },
      { id: "act-2", at: "2026-11-18", text: "Lena Cho saved a draft of Coaching a Stuck Learner.", roles: ["admin", "instructor"], instructorId: "lena" },
      { id: "act-3", at: "2026-11-16", text: "Maya Chen submitted “Name the bias in this chart.”", roles: ["admin", "instructor", "learner"], learnerId: "maya", instructorId: "jonah" },
      { id: "act-4", at: "2026-11-15", text: "Chloe Nguyen submitted a 45-minute session plan.", roles: ["admin", "instructor"], instructorId: "lena" },
      { id: "act-5", at: "2026-11-12", text: "Chloe Nguyen completed Models for a Monday Decision.", roles: ["admin", "instructor", "learner"], instructorId: "jonah" },
      { id: "act-6", at: "2026-11-09", text: "Jonah Ellis reviewed Luca Moretti’s visual argument.", roles: ["admin", "instructor"], instructorId: "jonah" },
      { id: "act-7", at: "2026-11-08", text: "Aisha Rahman completed Hybrid Session Craft.", roles: ["admin", "instructor", "learner"], instructorId: "lena" },
      { id: "act-8", at: "2026-11-05", text: "Rowan Blake finished the last enrolled course.", roles: ["admin"] },
    ],
    reviewSnapshot: { asOf: "2026-10-31", pending: 8 },
    learnerSnapshot: { asOf: "2026-10-31", active: 7 },
    tickets: [
      {
        id: "tkt-lesson",
        name: "Maya Chen",
        email: "maya.chen@demo.northroom.local",
        subject: "Next lesson returns to the course page",
        message: "On Evidence Before Charts, marking a lesson complete brings me back to the course instead of the following lesson. This message stays in the demo and is not emailed.",
        createdAt: "2026-11-17T09:20:00.000Z",
        priority: "normal",
        status: "open",
      },
      {
        id: "tkt-roster",
        name: "Jonah Ellis",
        email: "jonah.ellis@demo.northroom.local",
        subject: "A learner is missing from the roster",
        message: "One invited learner does not appear on Hybrid Session Craft. I checked the enrollment list in this browser.",
        createdAt: "2026-11-16T14:05:00.000Z",
        priority: "high",
        status: "in_progress",
      },
      {
        id: "tkt-cert",
        name: "Amira Shah",
        email: "amira.shah@demo.northroom.local",
        subject: "Certificate preview wording",
        message: "The preview should keep saying it is not a verified credential. No change is required on a server.",
        createdAt: "2026-11-12T11:40:00.000Z",
        priority: "low",
        status: "closed",
      },
    ],
  };

  assertSeed(state);
  return state;
}

function assertSeed(state: DemoState) {
  const learners = state.users.filter((user) => user.role === "learner");
  const engagement = { active: 0, at_risk: 0, inactive: 0, completed: 0 };
  for (const learner of learners) {
    if (!learner.engagement) throw new Error(`Learner ${learner.id} has no engagement`);
    engagement[learner.engagement] += 1;
  }
  if (learners.length !== 16) throw new Error(`Expected 16 learners, got ${learners.length}`);
  if (engagement.active !== 9 || engagement.at_risk !== 3 || engagement.inactive !== 2 || engagement.completed !== 2) {
    throw new Error(`Engagement drift ${JSON.stringify(engagement)}`);
  }
  if (state.enrollments.length !== 44) throw new Error(`Expected 44 enrollments, got ${state.enrollments.length}`);
  const completed = state.enrollments.filter((item) => item.completedAt);
  if (completed.length !== 11) throw new Error(`Expected 11 completions, got ${completed.length}`);
  const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
  const expectedEnrolled = [5, 6, 7, 8, 10, 8];
  const expectedCompleted = [0, 1, 1, 2, 3, 4];
  months.forEach((month, index) => {
    const enrolled = state.enrollments.filter((item) => item.enrolledAt.startsWith(month)).length;
    const done = state.enrollments.filter((item) => item.completedAt?.startsWith(month)).length;
    if (enrolled !== expectedEnrolled[index] || done !== expectedCompleted[index]) {
      throw new Error(`${month} expected ${expectedEnrolled[index]}/${expectedCompleted[index]} got ${enrolled}/${done}`);
    }
  });
  if (state.submissions.filter((item) => item.status === "pending").length !== 5) {
    throw new Error("Pending review count drifted");
  }
  if (state.courses.filter((course) => course.status === "published").length !== 7) {
    throw new Error("Published course count drifted");
  }
  for (const enrollment of state.enrollments) {
    const course = state.courses.find((item) => item.id === enrollment.courseId);
    if (!course) throw new Error(`Enrollment missing course ${enrollment.courseId}`);
    const total = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);
    if (enrollment.completedLessonIds.length > total) throw new Error(`Too many lessons on ${enrollment.id}`);
    if (enrollment.completedAt && enrollment.completedLessonIds.length !== total) {
      throw new Error(`Completed enrollment is partial: ${enrollment.id}`);
    }
  }
  for (const quiz of state.quizzes) {
    const course = state.courses.find((item) => item.id === quiz.courseId);
    const lesson = course?.modules.flatMap((module) => module.lessons).find((item) => item.id === quiz.lessonId);
    if (!lesson || lesson.quizId !== quiz.id) throw new Error(`Quiz ${quiz.id} is not attached to its lesson`);
  }
}
