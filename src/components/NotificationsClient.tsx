"use client";

import { useMemo, useState } from "react";
import type { User } from "@/lib/store";
import { initials } from "@/lib/format";

export function NotificationsClient({ users, preselectUserId }: { users: User[]; preselectUserId?: string | null }) {
  const [mode, setMode] = useState<"one" | "all">("one");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(preselectUserId ?? users[0]?.id ?? null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  }, [users, query]);

  const selected = users.find((u) => u.id === selectedId) ?? null;

  async function send() {
    setError(null);
    setNotice(null);
    if (!message.trim()) {
      setError("Write a message first.");
      return;
    }
    if (mode === "one" && !selected) {
      setError("Choose a recipient.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/admin/notifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(mode === "all" ? { all: true, message } : { userId: selected!.id, message }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send");
      return;
    }
    setNotice(mode === "all" ? `Sent to all ${data.recipients} users.` : `Sent to ${selected!.name}.`);
    setMessage("");
  }

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Notifications</h1>
          <span className="text-xs text-text-tertiary">Send a message straight to one user&rsquo;s notification bell, or everyone at once</span>
        </div>
      </header>

      <div className="grid md:grid-cols-[1fr_320px] gap-5 px-8 py-6 max-w-[900px]">
        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border-subtle h-fit">
          <div className="flex gap-2">
            <button
              onClick={() => setMode("one")}
              className={`flex-1 py-2.5 rounded-lg border text-[12.5px] font-bold ${mode === "one" ? "border-accent bg-accent/15 text-accent" : "border-border-subtle text-text-secondary"}`}
            >
              One User
            </button>
            <button
              onClick={() => setMode("all")}
              className={`flex-1 py-2.5 rounded-lg border text-[12.5px] font-bold ${mode === "all" ? "border-accent bg-accent/15 text-accent" : "border-border-subtle text-text-secondary"}`}
            >
              All Users
            </button>
          </div>

          {mode === "one" && (
            <div className="flex flex-col gap-2">
              <label className="text-[11px] text-text-tertiary font-semibold">Recipient</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, username, email…"
                className="px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent"
              />
              <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto rounded-lg border border-border-subtle">
                {filtered.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 text-left border-t border-border-subtle first:border-t-0 ${
                      selectedId === u.id ? "bg-accent/15" : ""
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0">
                      {initials(u.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className={`text-[12.5px] font-semibold truncate ${selectedId === u.id ? "text-accent" : ""}`}>{u.name}</span>
                      <span className="text-[10.5px] text-text-tertiary truncate">{u.email}</span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && <div className="px-3 py-4 text-center text-[12px] text-text-tertiary">No users match.</div>}
              </div>
            </div>
          )}

          {mode === "all" && (
            <div className="flex gap-2.5 items-start p-3.5 rounded-lg bg-warning/10 border border-border-subtle">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.3 3.9L2.6 18a2 2 0 0 0 1.8 3h15.2a2 2 0 0 0 1.8-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
              </svg>
              <span className="text-[11.5px] text-text-secondary leading-relaxed">
                This goes to every registered user ({users.length} accounts) — use it for platform-wide announcements.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-text-tertiary font-semibold">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="e.g. We've added USDT deposits — check your Wallet."
              className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent resize-none"
            />
          </div>

          {error && <span className="text-xs text-negative font-semibold">{error}</span>}
          {notice && <span className="text-xs text-positive font-semibold">{notice}</span>}

          <button
            onClick={send}
            disabled={busy}
            className="self-start px-6 py-3 rounded-lg bg-accent text-accent-fg font-extrabold text-[13px] disabled:opacity-50"
          >
            {busy ? "Sending…" : mode === "all" ? `Send to All ${users.length} Users` : selected ? `Send to ${selected.name}` : "Send"}
          </button>
        </div>

        <div className="flex flex-col gap-2 p-5 rounded-2xl bg-surface border border-border-subtle h-fit">
          <span className="text-[12.5px] font-bold">How it works</span>
          <p className="m-0 text-[11.5px] text-text-tertiary leading-relaxed">
            The message shows up in the recipient&rsquo;s notification bell right away. Every send — one user or a
            broadcast — is written to the audit log with your admin ID, the recipient, and the exact message.
          </p>
        </div>
      </div>
    </>
  );
}
