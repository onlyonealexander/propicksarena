"use client";

import { useState } from "react";
import type { User, Transaction, Bet } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { money, signedMoney, dateTime, initials } from "@/lib/format";

type Section = "Overview" | "History" | "Transactions" | "Profile" | "Security";

const NAV: { key: Section; label: string; icon: React.ReactNode }[] = [
  {
    key: "Overview",
    label: "Account Overview",
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
    key: "History",
    label: "Betting History",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    key: "Transactions",
    label: "Transactions",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 3v18M7 3l-3 3M7 3l3 3M17 21V3M17 21l-3-3M17 21l3-3" />
      </svg>
    ),
  },
  {
    key: "Profile",
    label: "Profile Settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
      </svg>
    ),
  },
  {
    key: "Security",
    label: "Security",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      </svg>
    ),
  },
];

const BET_FILTERS = ["All", "Pending", "Won", "Lost", "Cancelled", "Void", "Refunded"] as const;

function payout(b: Bet, symbol: string): { label: string; color: string } {
  if (b.status === "Won") return { label: money(b.potentialPayout, symbol), color: "text-positive" };
  if (b.status === "Lost") return { label: `-${money(b.stake, symbol)}`, color: "text-negative" };
  if (b.status === "Pending") return { label: `Potential ${money(b.potentialPayout, symbol)}`, color: "text-text-secondary" };
  return { label: money(b.stake, symbol), color: "text-text-tertiary" };
}

export function AccountClient({
  user,
  balances,
  transactions,
  bets,
  initialTab,
  logoutAction,
}: {
  user: User;
  balances: { available: number; pending: number };
  transactions: Transaction[];
  bets: Bet[];
  initialTab: Section;
  logoutAction: () => void;
}) {
  const [section, setSection] = useState<Section>(initialTab);
  const [betFilter, setBetFilter] = useState<(typeof BET_FILTERS)[number]>("All");
  const [twoFa, setTwoFa] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  async function submitPasswordChange() {
    setPasswordError(null);
    setPasswordNotice(null);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in every field.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }
    setPasswordBusy(true);
    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPasswordBusy(false);
    if (!res.ok) {
      setPasswordError(data.error ?? "Could not change password");
      return;
    }
    setPasswordNotice("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  }

  const openBets = bets.filter((b) => b.status === "Pending").length;
  const won = bets.filter((b) => b.status === "Won").length;
  const decided = bets.filter((b) => b.status === "Won" || b.status === "Lost").length;
  const winRate = decided ? Math.round((won / decided) * 100) : 0;
  const filteredBets = bets.filter((b) => betFilter === "All" || b.status === betFilter);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-7 items-start">
      <aside className="flex flex-col gap-5">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface border border-border-subtle">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-[oklch(0.6_0.15_230)] flex items-center justify-center text-[15px] font-bold text-accent-fg font-display flex-shrink-0">
            {initials(user.name)}
          </div>
          <div className="flex flex-col gap-px min-w-0">
            <span className="text-[13.5px] font-bold truncate">{user.name}</span>
            <span className="text-[11px] text-text-tertiary">Verified Member</span>
          </div>
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => (
            <button
              key={item.key}
              onClick={() => setSection(item.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-left ${
                section === item.key ? "bg-surface text-text" : "text-text-secondary"
              }`}
            >
              <span className={section === item.key ? "text-accent" : "text-text-tertiary"}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-negative w-full text-left">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Log Out
          </button>
        </form>
      </aside>

      <main className="flex flex-col gap-6 min-w-0">
        {section === "Overview" && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="flex flex-col gap-1.5 p-[18px] rounded-2xl bg-gradient-to-br from-[oklch(0.22_0.03_195)] to-[oklch(0.19_0.02_250)] border border-border-subtle">
                <span className="text-[11px] text-text-secondary font-semibold">Available Balance</span>
                <span className="nums text-[22px] font-bold">{money(balances.available, user.currencySymbol)}</span>
              </div>
              <div className="flex flex-col gap-1.5 p-[18px] rounded-2xl bg-surface border border-border-subtle">
                <span className="text-[11px] text-text-tertiary font-semibold">Pending Balance</span>
                <span className="nums text-xl font-bold text-warning">{money(balances.pending, user.currencySymbol)}</span>
              </div>
              <div className="flex flex-col gap-1.5 p-[18px] rounded-2xl bg-surface border border-border-subtle">
                <span className="text-[11px] text-text-tertiary font-semibold">Open Bets</span>
                <span className="nums text-xl font-bold">{openBets}</span>
              </div>
              <div className="flex flex-col gap-1.5 p-[18px] rounded-2xl bg-surface border border-border-subtle">
                <span className="text-[11px] text-text-tertiary font-semibold">Win Rate</span>
                <span className="nums text-xl font-bold text-positive">{winRate}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Recent Bets</span>
                <button onClick={() => setSection("History")} className="text-xs font-bold text-accent">
                  View all
                </button>
              </div>
              <div className="rounded-2xl border border-border-subtle bg-surface overflow-hidden">
                {bets.slice(0, 5).map((b) => {
                  const p = payout(b, user.currencySymbol);
                  return (
                    <div key={b.id} className="flex items-center gap-4 px-[18px] py-3.5 border-t border-border-subtle first:border-t-0">
                      <StatusBadge status={b.status} />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="text-[12.5px] font-semibold truncate">{b.selections.map((s) => s.matchLabel).join(", ")}</span>
                        <span className="text-[11px] text-text-tertiary truncate">{b.selections.map((s) => s.label).join(" + ")}</span>
                      </div>
                      <span className="nums text-xs text-text-tertiary flex-shrink-0 hidden sm:inline">Stake {money(b.stake, user.currencySymbol)}</span>
                      <span className={`nums text-[13px] font-bold flex-shrink-0 ${p.color}`}>{p.label}</span>
                    </div>
                  );
                })}
                {bets.length === 0 && <div className="px-[18px] py-8 text-center text-text-tertiary text-[13px]">No bets placed yet — head to the homepage to get started.</div>}
              </div>
            </div>
          </div>
        )}

        {section === "History" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {BET_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setBetFilter(f)}
                  className={`px-3.5 py-2 rounded-full border text-xs whitespace-nowrap ${
                    betFilter === f ? "border-accent bg-accent/15 text-accent font-bold" : "border-border-subtle text-text-secondary font-semibold"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Bet ID", "Match", "Selection", "Stake", "Odds", "Payout", "Status", "Date"].map((h) => (
                      <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-3.5 pb-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBets.map((b) => {
                    const p = payout(b, user.currencySymbol);
                    return (
                      <tr key={b.id} className="border-t border-border-subtle">
                        <td className="nums px-3.5 py-3 text-[12px] text-text-secondary whitespace-nowrap">{b.id}</td>
                        <td className="px-3.5 py-3 text-[12.5px] font-semibold whitespace-nowrap">{b.selections.map((s) => s.matchLabel).join(", ")}</td>
                        <td className="px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{b.selections.map((s) => s.label).join(" + ")}</td>
                        <td className="nums px-3.5 py-3 text-[12.5px] whitespace-nowrap">{money(b.stake, user.currencySymbol)}</td>
                        <td className="nums px-3.5 py-3 text-[12.5px] whitespace-nowrap">{b.totalOdds.toFixed(2)}</td>
                        <td className={`nums px-3.5 py-3 text-[12.5px] font-bold whitespace-nowrap ${p.color}`}>{p.label}</td>
                        <td className="px-3.5 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="px-3.5 py-3 text-[12px] text-text-tertiary whitespace-nowrap">{dateTime(b.placedAt)}</td>
                      </tr>
                    );
                  })}
                  {filteredBets.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3.5 py-8 text-center text-text-tertiary text-[13px]">
                        No bets match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {section === "Transactions" && (
          <div className="rounded-2xl border border-border-subtle bg-surface overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Transaction ID", "Date/Time", "Type", "Amount", "Status", "Reference"].map((h) => (
                    <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-3.5 pb-2.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-border-subtle">
                    <td className="nums px-3.5 py-3 text-[12px] text-text-secondary whitespace-nowrap">{t.id}</td>
                    <td className="px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{dateTime(t.createdAt)}</td>
                    <td className="px-3.5 py-3 text-[12.5px] font-semibold whitespace-nowrap">{t.type}</td>
                    <td className={`nums px-3.5 py-3 text-[12.5px] font-bold whitespace-nowrap ${t.amount < 0 ? "text-text" : "text-positive"}`}>{signedMoney(t.amount, user.currencySymbol)}</td>
                    <td className="px-3.5 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="nums px-3.5 py-3 text-[11.5px] text-text-tertiary whitespace-nowrap">{t.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {section === "Profile" && (
          <div className="flex flex-col gap-[18px] p-6 rounded-2xl bg-surface border border-border-subtle max-w-xl">
            <span className="text-sm font-bold">Profile Settings</span>
            <div className="grid grid-cols-2 gap-3.5">
              {[
                ["Full Name", user.name],
                ["Username", user.username],
                ["Email", user.email],
                ["Phone", user.phone],
                ["Country", user.country],
                ["Display Currency", `${user.currencyCode} (${user.currencySymbol})`],
                ["Registered", dateTime(user.registeredAt)],
                ["Status", user.status],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-text-tertiary font-semibold">{label}</span>
                  <div className="px-3.5 py-2.5 rounded-lg bg-surface-2 border border-border-subtle text-[13px]">{value}</div>
                </div>
              ))}
            </div>
            <button className="self-start px-5 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[13px]">Edit Profile</button>
          </div>
        )}

        {section === "Security" && (
          <div className="flex flex-col gap-3.5 max-w-2xl">
            <div className="flex items-center justify-between p-5 rounded-2xl bg-surface border border-border-subtle">
              <div className="flex flex-col gap-1">
                <span className="text-[13.5px] font-bold">Two-Factor Authentication</span>
                <span className="text-xs text-text-tertiary">Adds an extra layer of security to your account</span>
              </div>
              <button
                onClick={() => setTwoFa((v) => !v)}
                className={`relative w-[42px] h-6 rounded-full transition-colors ${twoFa ? "bg-accent" : "bg-surface-2"}`}
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all"
                  style={{ left: twoFa ? "21px" : "3px" }}
                />
              </button>
            </div>
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface border border-border-subtle">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-[13.5px] font-bold">Password</span>
                  <span className="text-xs text-text-tertiary">Change the password you use to sign in</span>
                </div>
                {!showPasswordForm && (
                  <button
                    onClick={() => {
                      setShowPasswordForm(true);
                      setPasswordNotice(null);
                      setPasswordError(null);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-border text-[12.5px] font-semibold"
                  >
                    Change Password
                  </button>
                )}
              </div>

              {passwordNotice && !showPasswordForm && <span className="text-xs text-positive font-semibold">{passwordNotice}</span>}

              {showPasswordForm && (
                <div className="flex flex-col gap-3 pt-1 border-t border-border-subtle">
                  <div className="flex flex-col gap-1.5 pt-3">
                    <label className="text-[11.5px] text-text-tertiary font-semibold">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] text-text-tertiary font-semibold">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11.5px] text-text-tertiary font-semibold">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="px-3.5 py-2.5 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  {passwordError && <span className="text-xs text-negative font-semibold">{passwordError}</span>}
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={submitPasswordChange}
                      disabled={passwordBusy}
                      className="px-5 py-2.5 rounded-lg bg-accent text-accent-fg font-bold text-[12.5px] disabled:opacity-50"
                    >
                      {passwordBusy ? "Saving…" : "Save New Password"}
                    </button>
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError(null);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="px-5 py-2.5 rounded-lg border border-border text-text-secondary text-[12.5px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
