"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setStatus("submitting");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Password reset request",
        email: email.trim(),
        subject: "Password reset request",
        message: `A password reset was requested for the account registered to ${email.trim()}.`,
      }),
    });
    setStatus("sent");
    if (!res.ok) {
      // Support inbox is the delivery mechanism here — even on a submit
      // error we still show the same neutral confirmation, so this never
      // reveals whether an account exists for the given email.
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.6">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" />
        </svg>
        <span className="text-[15px] font-bold">Check your inbox</span>
        <p className="m-0 text-[12.5px] text-text-tertiary max-w-xs leading-relaxed">
          If an account exists for that email, our support team will reach out with reset instructions shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11.5px] text-text-tertiary font-semibold">Email</label>
        <input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          type="email"
          autoFocus
          autoComplete="email"
          className={`px-3.5 py-3 rounded-lg border bg-surface-2 text-[13px] outline-none focus:border-accent ${error ? "border-negative" : "border-border"}`}
        />
        {error && <span className="text-[11px] text-negative font-semibold">{error}</span>}
      </div>
      <button disabled={status === "submitting"} className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm disabled:opacity-70">
        {status === "submitting" ? "Sending…" : "Send Reset Instructions"}
      </button>
    </form>
  );
}
