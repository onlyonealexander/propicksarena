"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Notif = { id: string; message: string; category: string; href?: string; createdAt: string; read: boolean };

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnread(d.unread ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      if (data.unread > 0) {
        await fetch("/api/notifications", { method: "POST" });
        setUnread(0);
      }
    }
  }

  function go(href?: string) {
    setOpen(false);
    if (href) router.push(href);
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        aria-label="Notifications"
        onClick={toggle}
        className="flex relative items-center justify-center w-9 h-9 rounded-lg border border-border-subtle bg-surface text-text-secondary flex-shrink-0"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-negative text-white text-[9px] font-bold flex items-center justify-center border-2 border-bg">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-[64px] sm:top-11 w-auto sm:w-[340px] max-w-full max-h-[min(420px,calc(100vh-84px))] flex flex-col rounded-2xl border border-border bg-surface shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border-subtle flex-shrink-0">
            <span className="text-[13px] font-bold">Notifications</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-border-subtle">
            {notifications.length === 0 && <div className="px-4 py-10 text-center text-[12.5px] text-text-tertiary">You&rsquo;re all caught up.</div>}
            {notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.href)}
                className="w-full flex flex-col items-start gap-1.5 px-4 py-3.5 text-left hover:bg-surface-2"
              >
                <span className="text-[12.5px] leading-snug break-words">{n.message}</span>
                <span className="flex items-center gap-1.5 text-[10.5px] text-text-tertiary whitespace-nowrap">
                  {n.category} &middot; {timeAgo(n.createdAt)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
