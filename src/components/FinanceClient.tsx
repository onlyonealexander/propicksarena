"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Transaction, PaymentMethod } from "@/lib/store";
import { StatusBadge } from "./StatusBadge";
import { PaymentMethodsSettings } from "./PaymentMethodsSettings";
import { money, dateTime } from "@/lib/format";

type Row = Transaction & { userName: string };

export function FinanceClient({ transactions, methods }: { transactions: Row[]; methods: PaymentMethod[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"wd" | "dp" | "hist">("wd");
  const [busyId, setBusyId] = useState<string | null>(null);

  const withdrawals = transactions.filter((t) => t.type === "Withdrawal");
  const deposits = transactions.filter((t) => t.type === "Deposit");
  const pendingWd = withdrawals.filter((t) => t.status === "Pending");
  const pendingDp = deposits.filter((t) => t.status === "Pending");

  async function review(id: string, decision: "approve" | "reject") {
    setBusyId(id);
    await fetch(`/api/admin/transactions/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusyId(null);
    router.refresh();
  }

  const tabStyle = (key: string) =>
    `px-1 py-3 mr-5 -mb-px border-b-2 text-[13px] ${tab === key ? "border-accent text-text font-bold" : "border-transparent text-text-tertiary font-semibold"}`;

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border-b border-border-subtle">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Finance</h1>
          <span className="text-xs text-text-tertiary">Review and process deposits &amp; withdrawals</span>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Stat label="Pending Withdrawals" value={String(pendingWd.length)} tone="warning" />
          <Stat label="Pending Deposits" value={String(pendingDp.length)} tone="warning" />
          <Stat label="Approved (all time)" value={String(withdrawals.filter((t) => t.status === "Successful").length)} />
          <Stat label="Rejected (all time)" value={String(withdrawals.filter((t) => t.status === "Rejected").length)} />
        </div>

        <PaymentMethodsSettings methods={methods} />

        <div className="flex gap-2 border-b border-border-subtle">
          <button onClick={() => setTab("wd")} className={tabStyle("wd")}>
            Pending Withdrawals
          </button>
          <button onClick={() => setTab("dp")} className={tabStyle("dp")}>
            Pending Deposits
          </button>
          <button onClick={() => setTab("hist")} className={tabStyle("hist")}>
            History
          </button>
        </div>

        {tab === "wd" && (
          <Table
            headers={["User", "Amount", "Destination", "Reference", "Requested", "Status", "Actions"]}
            rows={pendingWd}
            renderRow={(t) => (
              <>
                <Td bold>{t.userName}</Td>
                <Td nums bold>
                  {money(Math.abs(t.amount), t.currencySymbol)}
                </Td>
                <Td muted>{t.destination}</Td>
                <Td nums small muted>
                  {t.reference}
                </Td>
                <Td muted>{dateTime(t.createdAt)}</Td>
                <td className="px-3.5 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-3.5 py-3">
                  {t.status === "Pending" && (
                    <div className="flex gap-1.5">
                      <ActionButton tone="positive" busy={busyId === t.id} onClick={() => review(t.id, "approve")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="negative" busy={busyId === t.id} onClick={() => review(t.id, "reject")}>
                        Reject
                      </ActionButton>
                    </div>
                  )}
                </td>
              </>
            )}
          />
        )}

        {tab === "dp" && (
          <Table
            headers={["User", "Amount", "Method", "Reference", "Requested", "Status", "Actions"]}
            rows={pendingDp}
            renderRow={(t) => (
              <>
                <Td bold>{t.userName}</Td>
                <Td nums bold>
                  {money(t.amount, t.currencySymbol)}
                </Td>
                <Td muted>{t.method}</Td>
                <Td nums small muted>
                  {t.reference}
                </Td>
                <Td muted>{dateTime(t.createdAt)}</Td>
                <td className="px-3.5 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-3.5 py-3">
                  {t.status === "Pending" && (
                    <div className="flex gap-1.5">
                      <ActionButton tone="positive" busy={busyId === t.id} onClick={() => review(t.id, "approve")}>
                        Approve
                      </ActionButton>
                      <ActionButton tone="negative" busy={busyId === t.id} onClick={() => review(t.id, "reject")}>
                        Reject
                      </ActionButton>
                    </div>
                  )}
                </td>
              </>
            )}
          />
        )}

        {tab === "hist" && (
          <Table
            headers={["Reference", "User", "Type", "Amount", "Status", "Processed By", "Date"]}
            rows={transactions}
            renderRow={(t) => (
              <>
                <Td nums small muted>
                  {t.reference}
                </Td>
                <Td bold>{t.userName}</Td>
                <Td muted>{t.type}</Td>
                <Td nums bold>
                  {money(t.amount, t.currencySymbol)}
                </Td>
                <td className="px-3.5 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <Td muted>{t.processedBy ?? "—"}</Td>
                <Td muted>{dateTime(t.createdAt)}</Td>
              </>
            )}
          />
        )}

        <div className="flex gap-2.5 items-start p-4 rounded-lg bg-accent/10 border border-border-subtle">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          <span className="text-xs text-text-secondary leading-relaxed">
            Balances cannot be edited directly. Approving or rejecting here creates an immutable transaction record and
            updates the user&rsquo;s balance automatically — every action is written to the audit log with your admin ID.
          </span>
        </div>
      </div>
    </>
  );
}

function Table<T extends { id: string }>({ headers, rows, renderRow }: { headers: string[]; rows: T[]; renderRow: (row: T) => React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-3.5 pb-2.5 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border-subtle">
              {renderRow(r)}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-3.5 py-8 text-center text-text-tertiary text-[13px]">
                Nothing here yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Td({ children, bold, muted, small, nums }: { children: React.ReactNode; bold?: boolean; muted?: boolean; small?: boolean; nums?: boolean }) {
  return (
    <td
      className={`px-3.5 py-3 whitespace-nowrap ${nums ? "nums" : ""} ${small ? "text-[11.5px]" : "text-[12.5px]"} ${
        bold ? "font-bold" : muted ? "text-text-tertiary" : ""
      }`}
    >
      {children}
    </td>
  );
}

function ActionButton({ tone, busy, onClick, children }: { tone: "positive" | "negative"; busy: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      disabled={busy}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md border text-[11px] font-bold disabled:opacity-50 ${
        tone === "positive" ? "border-positive bg-positive/15 text-positive" : "border-negative bg-negative/15 text-negative"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "warning" }) {
  return (
    <div className="flex flex-col gap-1.5 p-4 rounded-2xl bg-surface border border-border-subtle">
      <span className={`text-[11px] font-semibold ${tone === "warning" ? "text-warning" : "text-text-tertiary"}`}>{label}</span>
      <span className={`nums text-xl font-bold ${tone === "warning" ? "text-warning" : ""}`}>{value}</span>
    </div>
  );
}
