import OnboardingClient from "@/components/OnboardingClient";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ tutorial?: string }>;
}) {
  const { tutorial } = await searchParams;
  const tutorialMode = tutorial === "1";

  return <OnboardingClient continueHref={tutorialMode ? "/dashboard" : "/sign-up"} allowGuest={true} tutorialMode={tutorialMode} />;
}
