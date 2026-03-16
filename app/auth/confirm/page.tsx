import ConfirmEmailClient from "@/components/ConfirmEmailClient";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return <ConfirmEmailClient email={email} />;
}
