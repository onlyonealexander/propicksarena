"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SupportMessage } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { dateTime } from "@/lib/format";

export function InboxClient({ messages }: { messages: SupportMessage[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(messages[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const active = messages.find((m) => m.id === openId) ?? null;

  async function mark(id: string, status: SupportMessage["status"]) {
    setBusy(true);
    await fetch(`/api/admin/support/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  function open(m: SupportMessage) {
    setOpenId(m.id);
    if (m.status === "New") mark(m.id, "Read");
  }

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Support Inbox</h1>
          <span className="text-xs text-text-tertiary">{messages.filter((m) => m.status === "New").length} unread of {messages.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-[340px_1fr] px-8 py-6 gap-5 items-start">
        <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface overflow-hidden max-h-[75vh] overflow-y-auto">
          {messages.map((m) => (
            <button
              key={m.id}
              onClick={() => open(m)}
              className={`flex flex-col gap-1.5 px-4 py-3.5 border-t border-border-subtle first:border-t-0 text-left ${
                openId === m.id ? "bg-surface-2" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[12.5px] truncate ${m.status === "New" ? "font-extrabold" : "font-semibold"}`}>{m.name}</span>
                <StatusBadge status={m.status} />
              </div>
              <span className="text-[12px] text-text-secondary truncate">{m.subject}</span>
              <span className="text-[10.5px] text-text-tertiary">{dateTime(m.createdAt)}</span>
            </button>
          ))}
          {messages.length === 0 && <div className="px-4 py-10 text-center text-text-tertiary text-[13px]">No messages yet.</div>}
        </div>

        {active ? (
          <div className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[16px] font-bold">{active.subject}</span>
                <span className="text-[12.5px] text-text-secondary">
                  {active.name} &middot; {active.email}
                </span>
                <span className="text-[11px] text-text-tertiary">{dateTime(active.createdAt)}</span>
              </div>
              <StatusBadge status={active.status} />
            </div>
            <p className="m-0 text-[13.5px] text-text-secondary leading-relaxed whitespace-pre-wrap">{active.message}</p>
            <div className="flex gap-2.5 pt-3 border-t border-border-subtle">
              <button
                disabled={busy}
                onClick={() => mark(active.id, "Replied")}
                className="px-4 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-50"
              >
                Mark as Replied
              </button>
              <a
                href={`mailto:${active.email}?subject=${encodeURIComponent("Re: " + active.subject)}`}
                className="px-4 py-2.5 rounded-lg border border-border text-[12.5px] font-semibold"
              >
                Reply by Email
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-subtle bg-surface p-10 text-center text-text-tertiary text-[13px]">
            Select a message to read it.
          </div>
        )}
      </div>
    </>
  );
}
