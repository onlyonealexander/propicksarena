"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Field = "name" | "username" | "email" | "phone" | "password" | "confirm";

export function SignupForm() {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  function set(field: Field, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const errors: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) errors.name = "Enter your full name.";
    if (!values.username.trim()) errors.username = "Choose a username.";
    if (!values.email.trim()) errors.email = "Enter your email.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
    if (!values.phone.trim()) errors.phone = "Enter your phone number.";
    if (!values.password) errors.password = "Choose a password.";
    else if (values.password.length < 6) errors.password = "At least 6 characters.";
    if (values.confirm !== values.password) errors.confirm = "Passwords don't match.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("idle");
        setFormError(data.error ?? "Could not create your account.");
        return;
      }
      setStatus("success");
      router.push("/");
      router.refresh();
    } catch {
      setStatus("idle");
      setFormError("Network error — please try again.");
    }
  }

  const busy = status === "submitting" || status === "success";

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
      <TextField label="Full Name" value={values.name} onChange={(v) => set("name", v)} error={fieldErrors.name} autoFocus autoComplete="name" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Username" value={values.username} onChange={(v) => set("username", v)} error={fieldErrors.username} autoComplete="username" />
        <TextField
          label="Phone (with country code)"
          value={values.phone}
          onChange={(v) => set("phone", v)}
          error={fieldErrors.phone}
          placeholder="+44 7911 123456"
          autoComplete="tel"
        />
      </div>
      <span className="-mt-2 text-[10.5px] text-text-tertiary">We set your display currency from your phone&rsquo;s country code.</span>
      <TextField label="Email" type="email" value={values.email} onChange={(v) => set("email", v)} error={fieldErrors.email} autoComplete="email" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Password" type="password" value={values.password} onChange={(v) => set("password", v)} error={fieldErrors.password} autoComplete="new-password" />
        <TextField label="Confirm" type="password" value={values.confirm} onChange={(v) => set("confirm", v)} error={fieldErrors.confirm} autoComplete="new-password" />
      </div>
      {formError && <span className="text-xs text-negative font-semibold">{formError}</span>}
      <label className="flex items-start gap-2 text-[11.5px] text-text-tertiary">
        <input type="checkbox" required className="mt-0.5" />
        I confirm I&rsquo;m 18 or older and agree to the betting rules &amp; terms.
      </label>
      <button
        disabled={busy}
        className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm mt-1 disabled:opacity-70"
      >
        {status === "submitting" ? "Creating account…" : status === "success" ? "Account created — redirecting…" : "Create Account"}
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  autoFocus,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoFocus?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11.5px] text-text-tertiary font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`px-3.5 py-3 rounded-lg border bg-surface-2 text-[13px] outline-none focus:border-accent ${
          error ? "border-negative" : "border-border"
        }`}
      />
      {error && <span className="text-[11px] text-negative font-semibold">{error}</span>}
    </div>
  );
}
