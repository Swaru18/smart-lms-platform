import type { Metadata } from "next";
import { SignUpScreen } from "@/components/auth/screens";

export const metadata: Metadata = { title: "Create account" };

export default function Page() {
  return <SignUpScreen />;
}
