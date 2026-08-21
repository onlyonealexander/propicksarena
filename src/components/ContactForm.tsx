"use client";

import { useState } from "react";

export function ContactForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [name, setName] = useState(defaultName ?? "");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Could not send your message");
      return;
    }
    setStatus("sent");
    setSubject("");
    setMessage("");
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-positive)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" />
        </svg>
        <span className="text-[15px] font-bold">Message sent</span>
        <span className="text-[12.5px] text-text-tertiary max-w-xs">
          Our support team will get back to you by email, usually within a few hours.
        </span>
        <button onClick={() => setStatus("idle")} className="mt-2 px-4 py-2 rounded-lg border border-border text-[12.5px] font-semibold">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3.5">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] text-text-tertiary font-semibold">Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11.5px] text-text-tertiary font-semibold">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11.5px] text-text-tertiary font-semibold">Subject</label>
        <input value={subject} onChange={(e) => setSubject(e.target.value)} required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11.5px] text-text-tertiary font-semibold">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent resize-none"
        />
      </div>
      {error && <span className="text-xs text-negative font-semibold">{error}</span>}
      <button disabled={busy} className="self-start px-6 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-60">
        {busy ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
