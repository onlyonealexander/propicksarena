"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User, Transaction, Bet } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { money, signedMoney, dateTime, initials } from "@/lib/format";

type EnrichedUser = User & {
  balance: number;
  deposits: number;
  withdrawals: number;
  betsCount: number;
  transactions: Transaction[];
  bets: Bet[];
};

const FILTERS = ["All", "Active", "Suspended", "Pending Verification", "Self-Excluded"] as const;

export function UsersClient({ users }: { users: EnrichedUser[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (filter === "All" || u.status === filter) &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q))
    );
  }, [users, query, filter]);

  const active = users.find((u) => u.id === openId) ?? null;

  async function toggleSuspend(u: EnrichedUser) {
    setBusy(true);
    await fetch(`/api/admin/users/${u.id}/status`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: u.status === "Suspended" ? "Active" : "Suspended" }),
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Users</h1>
          <span className="text-xs text-text-tertiary">{users.length} registered accounts</span>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 rounded-lg border border-border bg-surface w-full sm:w-[280px]">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, user ID…"
            className="flex-1 min-w-0 border-none bg-transparent outline-none text-[13px] py-2.5"
          />
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-full border text-xs whitespace-nowrap ${
                filter === f ? "border-accent bg-accent/15 text-accent font-bold" : "border-border-subtle text-text-secondary font-semibold"
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
                {["User ID", "Name", "Email", "Registered", "Status", "Balance", "Deposits", "Withdrawals", "Bets"].map((h) => (
                  <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-3.5 pb-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} onClick={() => setOpenId(u.id)} className="border-t border-border-subtle hover:bg-surface-2 cursor-pointer">
                  <td className="nums px-3.5 py-3 text-[12px] text-text-secondary whitespace-nowrap">{u.id}</td>
                  <td className="px-3.5 py-3 text-[12.5px] font-bold whitespace-nowrap">{u.name}</td>
                  <td className="px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{u.email}</td>
                  <td className="px-3.5 py-3 text-[12px] text-text-tertiary whitespace-nowrap">{dateTime(u.registeredAt)}</td>
                  <td className="px-3.5 py-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="nums px-3.5 py-3 text-[12.5px] font-bold whitespace-nowrap">{money(u.balance, u.currencySymbol)}</td>
                  <td className="nums px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{money(u.deposits, u.currencySymbol)}</td>
                  <td className="nums px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{money(u.withdrawals, u.currencySymbol)}</td>
                  <td className="nums px-3.5 py-3 text-[12.5px] text-text-secondary whitespace-nowrap">{u.betsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50" onClick={() => setOpenId(null)}>
          <div className="w-full sm:w-[460px] max-w-full h-full bg-surface border-l border-border flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-accent to-[oklch(0.6_0.15_230)] flex items-center justify-center text-sm font-bold text-accent-fg font-display">
                  {initials(active.name)}
                </div>
                <div className="flex flex-col gap-px">
                  <span className="text-[15px] font-bold">{active.name}</span>
                  <span className="text-[11.5px] text-text-tertiary">{active.id}</span>
                </div>
              </div>
              <button onClick={() => setOpenId(null)} className="w-[30px] h-[30px] rounded-lg bg-surface-2 flex items-center justify-center text-text-secondary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-6 px-4 sm:px-6 py-6">
              <StatusBadge status={active.status} />

              <Section title="Account Information">
                <Field label="Username" value={active.username} />
                <Field label="Email" value={active.email} />
                <Field label="Phone" value={active.phone} />
                <Field label="Country / Currency" value={`${active.country} · ${active.currencyCode}`} />
                <Field label="Registered" value={dateTime(active.registeredAt)} />
              </Section>

              <Section title="Wallet">
                <Stat label="Balance" value={money(active.balance, active.currencySymbol)} />
                <Stat label="Total Deposits" value={money(active.deposits, active.currencySymbol)} />
                <Stat label="Total Withdrawals" value={money(active.withdrawals, active.currencySymbol)} />
                <Stat label="Total Bets" value={String(active.betsCount)} />
              </Section>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wide">Recent Transactions</span>
                {active.transactions.length === 0 && <span className="text-xs text-text-tertiary">No transactions yet.</span>}
                {active.transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-t border-border-subtle">
                    <span className="text-xs">{t.type}</span>
                    <span className={`nums text-xs font-bold ${t.amount < 0 ? "text-text" : "text-positive"}`}>{signedMoney(t.amount, t.currencySymbol)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-text-tertiary uppercase tracking-wide">Account Controls</span>
                <a
                  href={`/admin/notifications?user=${active.id}`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-border bg-surface-2 text-text text-[12.5px] font-bold"
                >
                  Send Notification
                </a>
                <button
                  disabled={busy}
                  onClick={() => toggleSuspend(active)}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-[12.5px] font-bold disabled:opacity-60 ${
                    active.status === "Suspended" ? "border-positive bg-positive/15 text-positive" : "border-negative bg-negative/15 text-negative"
                  }`}
                >
                  {active.status === "Suspended" ? "Reinstate Account" : "Suspend Account"}
                </button>
                <span className="text-[10.5px] text-text-tertiary text-center">This action is written to the audit log with your admin ID.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-bold text-text-tertiary uppercase tracking-wide">{title}</span>
      <div className="grid grid-cols-2 gap-2.5">{children}</div>
    </div>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] text-text-tertiary">{label}</span>
      <span className="text-[12.5px] font-semibold">{value}</span>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-surface-2">
      <span className="text-[10.5px] text-text-tertiary block mb-1">{label}</span>
      <span className="nums text-[15px] font-bold">{value}</span>
    </div>
  );
}
