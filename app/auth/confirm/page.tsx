import Link from "next/link";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <div className="relative z-10 w-full max-w-xl animate-fade-up">
      <div className="text-center mb-8">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight">
          Everything<span className="text-[#6c63ff]">AP</span>
        </Link>
        <h1 className="font-display text-3xl font-bold mt-4 mb-2">Confirm your email</h1>
        <p className="text-[#8888aa] font-body text-sm max-w-md mx-auto leading-relaxed">
          Your account is almost ready. Open the email we sent and tap the confirmation link to finish signing in.
        </p>
      </div>

      <div className="bg-[#111118] border border-[#1e1e2e] rounded-3xl p-8 md:p-10">
        <div className="w-14 h-14 rounded-2xl bg-[#6c63ff]/12 border border-[#6c63ff]/20 flex items-center justify-center text-2xl mb-6 mx-auto">
          Mail
        </div>

        <div className="text-center mb-8">
          <p className="text-[#8888aa] font-body text-sm">Email sent to</p>
          <p className="text-[#e8e8f0] font-body font-semibold text-base mt-2 break-all">
            {email ?? "your inbox"}
          </p>
        </div>

        <div className="grid gap-3 mb-8">
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">1. Check your inbox and spam folder</p>
            <p className="font-body text-sm text-[#8888aa]">The message can take a minute or two to show up.</p>
          </div>
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">2. Open the confirmation link</p>
            <p className="font-body text-sm text-[#8888aa]">You will be redirected back here and signed into your dashboard.</p>
          </div>
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#0a0a0f] p-4">
            <p className="font-body font-medium text-sm text-[#e8e8f0] mb-1">3. Want to explore first?</p>
            <p className="font-body text-sm text-[#8888aa]">You can always browse in guest mode without saving progress.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/login"
            className="flex-1 py-3 text-center rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white font-body font-semibold text-sm transition-colors"
          >
            Back to sign in
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 text-center rounded-xl border border-[#1e1e2e] hover:border-[#2a2a3a] text-[#e8e8f0] font-body font-medium text-sm transition-colors"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
