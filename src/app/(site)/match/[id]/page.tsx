import Link from "next/link";
import { notFound } from "next/navigation";
import { getMatchById } from "@/lib/sportsdata";
import { getMarketStatus } from "@/lib/store";
import { OddsButton } from "@/components/OddsButton";
import { BetslipPanel } from "@/components/BetslipPanel";
import { MobileBetslip } from "@/components/MobileBetslip";
import { initials } from "@/lib/format";

export const revalidate = 20;

export default async function MatchPage({ params }: PageProps<"/match/[id]">) {
  const { id } = await params;
  const m = await getMatchById(id);
  if (!m) notFound();

  const marketStatus = await getMarketStatus(m.id);
  const disabled = marketStatus !== "Open" || m.status === "finished";

  return (
    <div className="max-w-[1200px] w-full mx-auto px-6 md:px-8 py-8 pb-24 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 items-start">
      <main className="flex flex-col gap-6 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          <Link href="/">Football</Link>
          <span>/</span>
          <span>{m.leagueName}</span>
          <span>/</span>
          <span className="text-text font-semibold">
            {m.home} vs {m.away}
          </span>
        </div>

        <div className="flex flex-col gap-5 px-7 py-8 rounded-2xl border border-border-subtle bg-gradient-to-br from-[oklch(0.21_0.025_200)] to-[oklch(0.18_0.018_250)]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-semibold">
              {m.leagueName} &middot; Matchday {m.matchday}
            </span>
            {m.status === "live" && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-live/15 text-live text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-live" />
                LIVE &middot; {m.minute}&rsquo;
              </span>
            )}
            {m.status === "finished" && <span className="px-2.5 py-1 rounded-full bg-text-tertiary/15 text-text-secondary text-[11px] font-bold">Full Time</span>}
            {m.status === "scheduled" && <span className="px-2.5 py-1 rounded-full bg-text-tertiary/15 text-text-secondary text-[11px] font-bold">Scheduled</span>}
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
            <TeamBlock name={m.home} crest={m.homeCrest} />
            <div className="flex flex-col items-center gap-1">
              {m.status === "scheduled" ? (
                <span className="nums text-2xl font-bold">
                  {new Date(m.kickoff).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                </span>
              ) : (
                <span className="nums text-4xl font-bold tracking-wide">
                  {m.homeScore} &ndash; {m.awayScore}
                </span>
              )}
              <span className="text-[11.5px] text-text-tertiary">{m.country}</span>
            </div>
            <TeamBlock name={m.away} crest={m.awayCrest} align="right" />
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-surface border border-border-subtle">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">Match Winner</span>
            <span className="text-[11px] text-text-tertiary">Full Time</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} league={`Football: ${m.leagueName}`} pick="1" label={m.home} odds={m.odds.home} disabled={disabled} />
            <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} league={`Football: ${m.leagueName}`} pick="X" label="Draw" odds={m.odds.draw} disabled={disabled} />
            <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} league={`Football: ${m.leagueName}`} pick="2" label={m.away} odds={m.odds.away} disabled={disabled} />
          </div>
          {marketStatus !== "Open" && (
            <span className="text-[11.5px] text-warning font-semibold">This market is currently {marketStatus.toLowerCase()} by the trading team.</span>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border-subtle text-[12.5px] text-text-tertiary leading-relaxed">
          Odds are modelled server-side from real in-season form (points per game and goal difference) pulled from
          the live fixture feed — not a licensed odds provider. When this fixture finishes, any pending bets on it
          settle automatically against the real final score.
        </div>
      </main>

      <div className="hidden lg:block">
        <BetslipPanel />
      </div>
      <MobileBetslip />
    </div>
  );
}

function TeamBlock({ name, crest, align = "left" }: { name: string; crest: string | null; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center gap-2.5 ${align === "right" ? "" : ""}`}>
      <div className="w-14 h-14 rounded-2xl bg-surface-2 flex items-center justify-center overflow-hidden">
        {crest ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crest} alt="" className="w-9 h-9 object-contain" />
        ) : (
          <span className="font-display font-bold text-base text-text-secondary">{initials(name)}</span>
        )}
      </div>
      <span className="text-[15px] font-bold text-center">{name}</span>
    </div>
  );
}
