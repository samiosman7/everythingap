import OnboardingClient from "@/components/OnboardingClient";

export default function OnboardingPage() {
  return <OnboardingClient continueHref="/sign-up" allowGuest={true} />;
}
