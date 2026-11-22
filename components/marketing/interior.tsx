"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  LineChart,
  Megaphone,
  Presentation,
  Users,
} from "lucide-react";
import { PageIntro, SiteFrame } from "./chrome";
import { ContactForm, DemoForm } from "./forms";

const featureNotes = [
  { icon: BookOpen, title: "Smart Course Management", text: "Create a course, keep it in draft, then publish it. Modules and lessons stay in a fixed order a learner can follow." },
  { icon: Users, title: "Student Management", text: "Students appear when they register. Status and last activity come from those accounts." },
  { icon: Presentation, title: "Instructor Workspace", text: "Instructors manage their own courses, roster and submissions." },
  { icon: BarChart3, title: "Learning Analytics", text: "Charts read enrollments stored in this browser." },
  { icon: ClipboardCheck, title: "Assessments & Examinations", text: "Quizzes sit on lessons. Assignments have a prompt, a due date and a place to write a response." },
  { icon: LineChart, title: "Progress Tracking", text: "Marking a lesson complete writes that lesson id onto the enrollment. The course page shows the new share finished." },
  { icon: Award, title: "Certificates", text: "A certificate preview appears when every lesson in a course is complete. It is not an accredited credential." },
  { icon: Megaphone, title: "Communication & Announcements", text: "Administrators can post a notice for learners, instructors or everyone. It appears in the notification list for that role." },
];

const resources = [
  { title: "Write the outcome first", text: "A course is easier to follow when the first line says what the learner will be able to do." },
  { title: "Keep the path short", text: "Modules and lessons should be only as long as the practice they support." },
  { title: "Review the work, not the decoration", text: "Assignments need a prompt, a due date and a place for feedback." },
];

export function AboutPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="About"
        title="A learning platform with the record attached."
        lede="Courses, teaching and progress in one workspace."
      />
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="text-[28px] font-semibold tracking-tight">What this release stores</h2>
          <p className="mt-4 text-[16px] leading-7 text-muted">Accounts, courses and progress stay in this browser. Passwords are hashed locally. This is not production authentication.</p>
          <p className="mt-4 text-[16px] leading-7 text-muted">Supabase Auth, the database and file storage are planned for the next phase. They are not connected yet.</p>
        </div>
        <div className="lg:col-span-7">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80" alt="An open notebook and pen on a desk" fill className="object-cover" sizes="(min-width: 1024px) 55vw, 100vw" />
          </div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto grid max-w-[1180px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-3">
          {[
            ["Courses have a path", "A module is a sequence of lessons with a time and a type, not a pile of files."],
            ["Teaching has a desk", "Instructors see their own courses and the work that still needs a response."],
            ["Progress is visible", "Completion is a count of finished lessons, shown to the learner and the organization."],
          ].map(([title, text]) => (
            <div key={title} className="border-t border-teal pt-4">
              <h3 className="text-[18px] font-semibold">{title}</h3>
              <p className="mt-2 text-[15px] leading-6 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteFrame>
  );
}

export function FeaturesPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Features"
        title="Eight parts of the learning operation."
        lede="The same areas appear in the admin, instructor and student workspaces."
      />
      <div className="mx-auto max-w-[860px] px-5 py-14 sm:px-8">
        {featureNotes.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <article key={feature.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 border-b border-line py-7">
              <span className="pt-1 text-[13px] font-semibold text-teal">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2 className="flex items-center gap-2 text-[22px] font-semibold"><Icon size={18} className="text-teal" aria-hidden />{feature.title}</h2>
                <p className="mt-2 text-[15px] leading-7 text-muted">{feature.text}</p>
              </div>
            </article>
          );
        })}
        <Link href="/signup" className="mt-8 inline-flex h-11 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Create account</Link>
      </div>
    </SiteFrame>
  );
}

export function InstitutionsPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="For institutions"
        title="Run the catalogue, the people and the reviews together."
        lede="Administrators publish courses, manage people and read completion."
      />
      <div className="mx-auto grid max-w-[1180px] items-start gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2">
        <div className="relative aspect-[16/11] overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1400&q=80" alt="Bookshelves in a library reading room" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <div>
          <ol className="divide-y divide-line border-y border-line">
            {[
              ["Course creation", "Draft a course, add modules and publish when the path is ready."],
              ["Student enrollment", "Students enroll in published courses. Records stay in this browser."],
              ["Assignment management", "Each published course can carry one assignment with a prompt and a due date."],
              ["Assessment management", "Quizzes are attached to lessons and scored in the learner workspace."],
              ["Progress monitoring", "Activity and completion stand in for attendance. There is no separate register in this phase."],
              ["Performance analytics", "Reports use the enrollments that exist. Empty workspaces stay empty."],
            ].map(([title, text], index) => (
              <li key={title} className="py-4">
                <p className="text-[12px] font-semibold text-teal">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-1 text-[18px] font-semibold">{title}</h2>
                <p className="mt-1 text-[14px] leading-6 text-muted">{text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/setup" className="inline-flex h-11 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Set up an administrator</Link>
            <Link href="/demo" className="inline-flex h-11 items-center rounded-full border border-line px-5 text-[14px] font-semibold">Book a demo</Link>
          </div>
        </div>
      </div>
    </SiteFrame>
  );
}

export function ResourcesPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Resources"
        title="Notes for course authors."
        lede="Short reminders. They are not a journal."
      />
      <div className="mx-auto max-w-[760px] px-5 py-14 sm:px-8">
        {resources.map((item) => (
          <article key={item.title} className="border-b border-line py-8">
            <h2 className="text-[24px] font-semibold tracking-tight">{item.title}</h2>
            <p className="mt-3 text-[16px] leading-7 text-muted">{item.text}</p>
          </article>
        ))}
        <Link href="/courses" className="mt-8 inline-flex h-11 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Open the courses</Link>
      </div>
    </SiteFrame>
  );
}

export function ContactPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Contact"
        title="Send a note."
        lede="Messages stay in this browser. The address is not a monitored inbox."
      />
      <div className="mx-auto grid max-w-[1180px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-2">
        <ContactForm />
        <div id="channels" className="scroll-mt-28">
          <h2 className="text-[22px] font-semibold">Support desk</h2>
          <dl className="mt-4 space-y-4 text-[15px]">
            <div>
              <dt className="text-[12px] tracking-[0.12em] text-muted uppercase">Email</dt>
              <dd className="mt-1"><a className="text-blue" href="mailto:support@smartlms.example">support@smartlms.example</a></dd>
            </div>
            <div>
              <dt className="text-[12px] tracking-[0.12em] text-muted uppercase">Hours</dt>
              <dd className="mt-1">Monday to Friday, 9:00–18:00</dd>
            </div>
            <div>
              <dt className="text-[12px] tracking-[0.12em] text-muted uppercase">Social channels</dt>
              <dd className="mt-1 leading-7 text-muted">The icons in the header are links to this note. Smart LMS does not operate live LinkedIn, Instagram or YouTube profiles in this demo.</dd>
            </div>
          </dl>
        </div>
      </div>
    </SiteFrame>
  );
}

export function LoginPage() {
  return (
    <SiteFrame>
      <PageIntro eyebrow="Sign in" title="Use your account." lede="Sign in with the email and password stored on this browser." />
      <div className="mx-auto max-w-[640px] px-5 py-12 sm:px-8">
        <Link href="/login" className="inline-flex h-11 items-center rounded-full bg-blue px-5 text-[14px] font-semibold text-[var(--on-action)]">Go to sign in</Link>
      </div>
    </SiteFrame>
  );
}

export function DemoPage() {
  return (
    <SiteFrame>
      <PageIntro
        eyebrow="Book a demo"
        title="Tell us what you want to see."
        lede="The request is saved on this device so you can keep a note of it. It does not book a calendar slot or notify a person."
      />
      <div className="mx-auto max-w-[640px] px-5 py-14 sm:px-8">
        <DemoForm />
      </div>
    </SiteFrame>
  );
}

export function PrivacyPage() {
  return (
    <SiteFrame>
      <PageIntro eyebrow="Privacy" title="What this browser stores." lede="Nothing on this site is sent to a server yet." />
      <article className="mx-auto max-w-[760px] px-5 py-12 text-[16px] leading-7 sm:px-8">
        <p>Accounts, hashed passwords, courses and messages are stored in this browser. They are not available on another device.</p>
        <p className="mt-4">Clearing site data removes them. There is no server account to delete.</p>
        <p className="mt-4 text-muted">This note describes the current prototype. It is not a legal privacy policy.</p>
      </article>
    </SiteFrame>
  );
}

export function TermsPage() {
  return (
    <SiteFrame>
      <PageIntro eyebrow="Terms" title="How to use this prototype." lede="Smart LMS on this site is not a contracted learning service." />
      <article className="mx-auto max-w-[760px] px-5 py-12 text-[16px] leading-7 sm:px-8">
        <p>Sign-in checks a password hash stored in this browser. That is not production authentication, and it does not protect an account across devices.</p>
        <p className="mt-4">Certificates are previews. They are not accredited credentials.</p>
        <p className="mt-4">Do not enter payment details or private records you cannot afford to keep on this device.</p>
        <p className="mt-4 text-muted">This page is not a commercial terms agreement.</p>
      </article>
    </SiteFrame>
  );
}
