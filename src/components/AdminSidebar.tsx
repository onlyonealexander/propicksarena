"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { initials } from "@/lib/format";

const NAV = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" />
        <circle cx="18" cy="9" r="2.5" />
        <path d="M15.5 14.2c2 .3 3.6 1.8 4.3 4.3" />
      </svg>
    ),
  },
  {
    href: "/admin/matches",
    label: "Matches & Markets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6" />
        <path d="M9 14l-2 7 5-3 5 3-2-7" />
      </svg>
    ),
  },
  {
    href: "/admin/special",
    label: "Special Markets",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/finance",
    label: "Finance",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v18M7 3l-3 3M7 3l3 3M17 21V3M17 21l-3-3M17 21l3-3" />
      </svg>
    ),
  },
  {
    href: "/admin/audit",
    label: "Audit Log",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M9 3v18M15 8l3 4-3 4" />
      </svg>
    ),
  },
  {
    href: "/admin/inbox",
    label: "Support Inbox",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),
  },
  {
    href: "/admin/notifications",
    label: "Notifications",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "Site Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

export function AdminSidebar({ adminName, role, logoutAction }: { adminName: string; role: string; logoutAction: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="bg-sidebar border-r border-border-subtle flex flex-col p-3.5 gap-6 sticky top-0 h-screen">
      <div className="flex items-center gap-2.5 px-2">
        <Logo size={24} />
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-[14.5px]">PROPICKS</span>
          <span className="text-[9.5px] text-text-tertiary font-bold tracking-wide">ARENA OPS</span>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] ${
                active ? "bg-surface text-text font-bold" : "text-text-secondary font-semibold"
              }`}
            >
              <span className={active ? "text-accent" : ""}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <form action={logoutAction} className="mt-auto flex items-center gap-2.5 p-3 rounded-2xl bg-surface border border-border-subtle">
        <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-accent to-[oklch(0.6_0.15_230)] flex items-center justify-center text-xs font-bold text-accent-fg font-display flex-shrink-0">
          {initials(adminName)}
        </div>
        <div className="flex flex-col gap-px min-w-0 flex-1">
          <span className="text-xs font-bold truncate">{adminName}</span>
          <span className="text-[10.5px] text-text-tertiary truncate">{role}</span>
        </div>
        <button type="submit" title="Sign out" className="text-text-tertiary p-1">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </form>
    </aside>
  );
}
