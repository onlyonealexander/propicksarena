import Link from "next/link";
import { platformStats, listAudit } from "@/lib/store";
import { getAllMatches } from "@/lib/sportsdata";
import { money, relativeTime, dateTime } from "@/lib/format";

export default async function AdminDashboardPage() {
  const stats = await platformStats();
  const audit = (await listAudit()).slice(0, 6);
  const matches = await getAllMatches();
  const liveCount = matches.filter((m) => m.status === "live").length;
  const finishedToday = matches.filter((m) => m.status === "finished").length;

  return (
    <>
      <header className="flex items-center justify-between px-8 py-[18px] border-b border-border-subtle sticky top-0 bg-bg/90 backdrop-blur-md z-10">
        <div>
          <h1 className="m-0 font-display text-xl font-bold">Dashboard</h1>
          <span className="text-xs text-text-tertiary">Overview of platform activity, live from the real fixture feed</span>
        </div>
        <Link href="/admin/matches" className="px-4 py-2.5 rounded-lg border border-border bg-surface text-[12.5px] font-semibold text-text-secondary">
          {liveCount} live now &middot; {finishedToday} finished today
        </Link>
      </header>

      <div className="flex flex-col gap-6 px-8 py-7 pb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Kpi label="Total Users" value={stats.totalUsers.toLocaleString()} />
          <Kpi label="Active Users" value={stats.activeUsers.toLocaleString()} />
          <Kpi label="Revenue (net)" value={money(stats.revenue)} tone="accent" />
          <Kpi label="System Alerts" value={stats.pendingWithdrawals.length > 5 ? "1 Active" : "0 Active"} tone={stats.pendingWithdrawals.length > 5 ? "negative" : undefined} />

          <Kpi label="Total Deposits" value={money(stats.totalDeposits)} />
          <Kpi label="Total Withdrawals" value={money(stats.totalWithdrawals)} />
          <Kpi label="Pending Withdrawals" value={String(stats.pendingWithdrawals.length)} tone="warning" />
          <Kpi label="Pending Deposits" value={String(stats.pendingDeposits.length)} tone="warning" />

          <Kpi label="Total Bets" value={stats.totalBets.toLocaleString()} />
          <Kpi label="Open Bets" value={String(stats.openBets)} tone="accent" />
          <Kpi label="Settled Bets" value={String(stats.settledBets)} />
          <Kpi label="Tracked Fixtures" value={matches.length.toLocaleString()} />
        </div>

        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-sm font-bold">Live Feed Status</span>
            <p className="m-0 text-[12.5px] text-text-secondary leading-relaxed">
              Match data is pulled from OpenLigaDB every 30–45 seconds for 2. Bundesliga and 3. Liga. Odds are
              recomputed from real season form on every fetch. When a tracked fixture finishes, run{" "}
              <Link href="/admin/matches" className="font-semibold">
                Sync &amp; Settle
              </Link>{" "}
              to resolve any pending bets automatically against the real final score.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-1">
              <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-surface-2">
                <span className="text-[10.5px] text-text-tertiary font-semibold uppercase">Live</span>
                <span className="nums text-lg font-bold text-live">{liveCount}</span>
              </div>
              <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-surface-2">
                <span className="text-[10.5px] text-text-tertiary font-semibold uppercase">Scheduled</span>
                <span className="nums text-lg font-bold">{matches.filter((m) => m.status === "scheduled").length}</span>
              </div>
              <div className="flex flex-col gap-1 p-3.5 rounded-lg bg-surface-2">
                <span className="text-[10.5px] text-text-tertiary font-semibold uppercase">Finished</span>
                <span className="nums text-lg font-bold">{matches.filter((m) => m.status === "finished").length}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-surface border border-border-subtle overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border-subtle">
              <span className="text-[13px] font-bold">Recent Admin Activity</span>
            </div>
            <div className="flex flex-col">
              {audit.map((a) => (
                <div key={a.id} className="flex gap-2.5 px-5 py-3 border-t border-border-subtle first:border-t-0">
                  <div className="w-6 h-6 rounded-full bg-surface-2 flex-shrink-0 flex items-center justify-center text-[9.5px] font-bold text-text-tertiary">
                    {a.actor.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-text-secondary leading-relaxed">
                    <b className="text-text">{a.actor}</b> {a.action.toLowerCase()} &middot; {a.target}
                    <span className="block text-[10.5px] text-text-tertiary">{relativeTime(a.timestamp)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl bg-surface border border-border-subtle overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border-subtle flex items-center justify-between">
            <span className="text-[13px] font-bold">Pending Finance Queue</span>
            <Link href="/admin/finance" className="text-xs font-bold text-accent">
              Open Finance
            </Link>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Type", "Reference", "Amount", "Requested", "Status"].map((h) => (
                  <th key={h} className="text-left text-[10.5px] font-bold text-text-tertiary uppercase tracking-wide px-5 pb-2.5 pt-3.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...stats.pendingWithdrawals, ...stats.pendingDeposits].slice(0, 6).map((t) => (
                <tr key={t.id} className="border-t border-border-subtle">
                  <td className="px-5 py-3 text-[12.5px] font-semibold">{t.type}</td>
                  <td className="nums px-5 py-3 text-[11.5px] text-text-tertiary">{t.reference}</td>
                  <td className="nums px-5 py-3 text-[12.5px] font-bold">{money(Math.abs(t.amount))}</td>
                  <td className="px-5 py-3 text-[12px] text-text-tertiary">{dateTime(t.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-warning/15 text-warning text-[10.5px] font-bold">Pending</span>
                  </td>
                </tr>
              ))}
              {stats.pendingWithdrawals.length + stats.pendingDeposits.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-tertiary text-[13px]">
                    Nothing pending review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "accent" | "warning" | "negative" }) {
  const color = tone === "accent" ? "text-accent" : tone === "warning" ? "text-warning" : tone === "negative" ? "text-negative" : "text-text";
  return (
    <div className="flex flex-col gap-2 p-[18px] rounded-2xl bg-surface border border-border-subtle">
      <span className="text-[11px] text-text-tertiary font-semibold">{label}</span>
      <span className={`nums text-[22px] font-bold ${color}`}>{value}</span>
    </div>
  );
}
