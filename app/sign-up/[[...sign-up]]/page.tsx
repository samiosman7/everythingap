import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-10 text-[#e8e8f0]">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center">
        <SignUp
          path="/sign-up"
          routing="path"
          signInUrl="/sign-in"
          forceRedirectUrl="/onboarding?tutorial=1"
          appearance={{
            elements: {
              card: "bg-[#111118] border border-[#1e1e2e] shadow-none rounded-3xl",
              headerTitle: "text-white",
              headerSubtitle: "text-[#8d8da8]",
              formButtonPrimary: "bg-[#6c63ff] hover:bg-[#7c73ff] text-white",
              footerActionLink: "text-[#9d96ff] hover:text-[#b7b2ff]",
              formFieldInput: "bg-[#0a0a0f] border border-[#1e1e2e] text-white",
              socialButtonsBlockButton: "bg-white text-black border border-white/20 hover:bg-[#f5f5f5]",
            },
          }}
        />
      </div>
    </div>
  );
}
