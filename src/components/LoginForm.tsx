"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) {
      setError("Enter your username/email and password.");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password, remember }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("idle");
        setError(data.error ?? "Incorrect username/email or password.");
        return;
      }
      setStatus("success");
      router.push(next && next.startsWith("/") ? next : "/");
      router.refresh();
    } catch {
      setStatus("idle");
      setError("Network error — please try again.");
    }
  }

  const busy = status === "submitting" || status === "success";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11.5px] text-text-tertiary font-semibold">Username or Email</label>
        <input
          value={identifier}
          onChange={(e) => {
            setIdentifier(e.target.value);
            setError(null);
          }}
          autoFocus
          autoComplete="username"
          aria-invalid={!!error}
          className={`px-3.5 py-3 rounded-lg border bg-surface-2 text-[13px] outline-none focus:border-accent ${error ? "border-negative" : "border-border"}`}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11.5px] text-text-tertiary font-semibold">Password</label>
          <Link href="/forgot-password" className="text-[11.5px] font-semibold text-accent">
            Forgot password?
          </Link>
        </div>
        <div className={`flex items-center rounded-lg border bg-surface-2 ${error ? "border-negative" : "border-border"}`}>
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="flex-1 min-w-0 px-3.5 py-3 bg-transparent outline-none text-[13px]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="px-3 text-text-tertiary flex-shrink-0"
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 4.22-5.94M9.9 4.24A10.9 10.9 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <path d="M1 1l22 22" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {error && <span className="text-xs text-negative font-semibold">{error}</span>}

      <label className="flex items-center gap-2 text-[12px] text-text-secondary font-semibold">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
        Keep me signed in on this device
      </label>

      <button disabled={busy} className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm mt-1 disabled:opacity-70">
        {status === "submitting" ? "Logging in…" : status === "success" ? "Signed in — redirecting…" : "Log In"}
      </button>
    </form>
  );
}
