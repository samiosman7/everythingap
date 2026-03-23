import { redirect } from "next/navigation";

export default function SetupGuidePage() {
  redirect("/onboarding?tutorial=1");
}
