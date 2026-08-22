import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3">
          <Logo size={36} />
          <h1 className="m-0 font-display text-xl font-bold">Reset your password</h1>
          <p className="m-0 text-[12.5px] text-text-tertiary text-center">
            Enter the email on your account and our support team will help you regain access.
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="m-0 text-center text-[12.5px] text-text-secondary">
          Remembered it after all?{" "}
          <Link href="/login" className="font-bold text-accent">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}
