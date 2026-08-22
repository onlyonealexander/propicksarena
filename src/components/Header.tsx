"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { SearchBox } from "./SearchBox";
import { NotificationBell } from "./NotificationBell";
import { initials, money } from "@/lib/format";
import { DEFAULT_CURRENCY } from "@/lib/currencies";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/?sport=football#sports", label: "Sports" },
  { href: "/#live", label: "Live Betting" },
  { href: "/account?tab=history", label: "My Bets" },
  { href: "/contact", label: "Support" },
];

export function Header({
  userName,
  available,
  currencySymbol = DEFAULT_CURRENCY.symbol,
}: {
  userName: string | null;
  available: number;
  currencySymbol?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-bg/90 backdrop-blur-md border-b border-border-subtle">
      <div className="flex items-center gap-2 sm:gap-4 md:gap-8 px-3 sm:px-4 md:px-8 py-3 md:py-3.5 max-w-[1400px] w-full mx-auto">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-border-subtle bg-surface text-text-secondary flex-shrink-0"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>

        <Link href="/" className="flex items-center gap-2 md:gap-2.5 flex-shrink-0">
          <Logo size={30} />
          <span className="hidden sm:inline font-display font-bold text-[15px] md:text-[17px] tracking-wide leading-none whitespace-nowrap">
            PROPICKS<span className="text-accent"> ARENA</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3.5 py-2 rounded-lg text-[13.5px] font-semibold ${
                i === 0 ? "text-text bg-surface" : "text-text-secondary hover:text-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3.5 ml-auto">
          <SearchBox />

          {userName ? (
            <>
              <NotificationBell />
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 md:pl-3 md:border-l md:border-border-subtle">
                <Link
                  href="/wallet"
                  className="flex flex-col items-end gap-px px-2 md:px-3 py-1.5 rounded-lg bg-surface border border-border-subtle max-w-[112px] sm:max-w-none"
                >
                  <span className="hidden sm:block text-[10px] text-text-tertiary font-semibold uppercase tracking-wide">Balance</span>
                  <span className="nums text-[11px] min-[380px]:text-[11.5px] md:text-[14px] font-bold whitespace-nowrap truncate max-w-full">{money(available, currencySymbol)}</span>
                </Link>
                <Link
                  href="/account"
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-[oklch(0.6_0.15_230)] flex items-center justify-center text-[12px] font-bold text-accent-fg font-display flex-shrink-0"
                >
                  {initials(userName)}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2 md:pl-3 md:border-l md:border-border-subtle">
              <Link href="/login" className="px-2.5 md:px-4 py-2 rounded-lg border border-border text-[12.5px] md:text-[13px] font-semibold text-text whitespace-nowrap">
                Log In
              </Link>
              <Link href="/signup" className="px-2.5 md:px-4 py-2 rounded-lg bg-accent text-accent-fg text-[12.5px] md:text-[13px] font-bold whitespace-nowrap">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {open && (
        <nav className="md:hidden flex flex-col gap-0.5 px-4 pb-3.5 border-t border-border-subtle pt-3">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`px-3.5 py-2.5 rounded-lg text-[13.5px] font-semibold ${
                i === 0 ? "text-text bg-surface" : "text-text-secondary"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
