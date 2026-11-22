import type { Metadata } from "next";
import { SetupAdminScreen } from "@/components/auth/screens";

export const metadata: Metadata = { title: "Administrator setup" };

export default function Page() {
  return <SetupAdminScreen />;
}