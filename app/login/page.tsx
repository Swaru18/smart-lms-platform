import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInScreen } from "@/components/auth/screens";

export const metadata: Metadata = { title: "Sign in" };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <SignInScreen />
    </Suspense>
  );
}
