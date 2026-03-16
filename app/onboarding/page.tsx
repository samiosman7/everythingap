import OnboardingClient from "@/components/OnboardingClient";

export default function OnboardingPage() {
  return <OnboardingClient continueHref="/auth/signup" allowGuest={true} />;
}
