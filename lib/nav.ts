import type { LucideIcon } from "lucide-react";
import {
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FolderTree,
  GraduationCap,
  LayoutDashboard,
  Library,
  LifeBuoy,
  Megaphone,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import type { Role } from "./types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: string;
};

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin",
  instructor: "/teach",
  learner: "/learn",
};

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  instructor: "Instructor",
  learner: "Learner",
};

export function navFor(role: Role): NavItem[] {
  if (role === "admin") {
    return [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, group: "Admin" },
      { href: "/admin/users", label: "Students", icon: Users, group: "People" },
      { href: "/admin/instructors", label: "Instructor Management", icon: UserRound, group: "People" },
      { href: "/admin/courses", label: "Course Management", icon: BookOpen, group: "Catalogue" },
      { href: "/admin/categories", label: "Categories", icon: FolderTree, group: "Catalogue" },
      { href: "/admin/enrollments", label: "Enrollments", icon: Library, group: "Catalogue" },
      { href: "/admin/assessments", label: "Assessments & Quizzes", icon: GraduationCap, group: "Learning" },
      { href: "/admin/assignments", label: "Assignments", icon: ClipboardCheck, group: "Learning" },
      { href: "/admin/certificates", label: "Certificates", icon: Award, group: "Learning" },
      { href: "/admin/reports", label: "Analytics & Reports", icon: BarChart3, group: "Insight" },
      { href: "/admin/announcements", label: "Announcements", icon: Megaphone, group: "Messages" },
      { href: "/admin/notifications", label: "Notifications", icon: Bell, group: "Messages" },
      { href: "/admin/support", label: "Support & Feedback", icon: LifeBuoy, group: "Messages" },
      { href: "/admin/calendar", label: "Calendar", icon: CalendarDays, group: "System" },
      { href: "/admin/settings", label: "Settings", icon: Settings, group: "System" },
    ];
  }
  if (role === "instructor") {
    return [
      { href: "/teach", label: "Overview", icon: LayoutDashboard, group: "Teaching" },
      { href: "/teach/courses", label: "My Courses", icon: BookOpen, group: "Teaching" },
      { href: "/teach/learners", label: "Student Progress", icon: Users, group: "Teaching" },
      { href: "/teach/reviews", label: "Submission Reviews", icon: ClipboardCheck, group: "Teaching" },
      { href: "/teach/analytics", label: "Analytics", icon: BarChart3, group: "Teaching" },
      { href: "/teach/calendar", label: "Calendar", icon: CalendarDays, group: "Teaching" },
      { href: "/account", label: "Profile", icon: UserRound, group: "Teaching" },
    ];
  }
  return [
    { href: "/learn", label: "My Learning", icon: LayoutDashboard, group: "Learning" },
    { href: "/learn/catalogue", label: "Explore Courses", icon: Library, group: "Learning" },
    { href: "/learn/assignments", label: "Assignments", icon: ClipboardCheck, group: "Learning" },
    { href: "/learn/assessments", label: "Assessments", icon: GraduationCap, group: "Learning" },
    { href: "/learn/calendar", label: "Calendar", icon: CalendarDays, group: "Learning" },
    { href: "/learn/achievements", label: "Certificates", icon: Award, group: "Learning" },
    { href: "/learn/profile", label: "Profile", icon: UserRound, group: "Learning" },
  ];
}

export function roleFromPath(pathname: string): Role | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/teach")) return "instructor";
  if (pathname.startsWith("/learn")) return "learner";
  return null;
}

export function titleFromPath(pathname: string, role: Role) {
  const items = navFor(role);
  const exact = items.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.includes("/lessons/")) return "Lesson";
  if (pathname.includes("/assessments/")) return "Assessment";
  if (pathname.includes("/reviews/")) return "Review";
  if (pathname.endsWith("/new") || pathname.includes("/courses/")) return "Course";
  if (pathname.startsWith("/account")) return "Profile";
  return items[0]?.label ?? "Smart LMS";
}
