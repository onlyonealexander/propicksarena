import { getLiveFixtures, LIVE_LEAGUES } from "@/lib/espnFeed";
import { getMarketStatus } from "@/lib/store";
import { OddsButton } from "./OddsButton";
import { kickoffLabel } from "@/lib/format";

export async function LiveSportSection({ sportKey }: { sportKey: string }) {
  const league = LIVE_LEAGUES[sportKey];
  const fixtures = await getLiveFixtures(sportKey);
  const live = fixtures.filter((f) => f.status === "live");
  const upcoming = fixtures.filter((f) => f.status === "scheduled").sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  const finished = fixtures
    .filter((f) => f.status === "finished")
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-9">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-positive/15 text-positive text-[11px] font-bold uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-positive" />
          Live Coverage
        </span>
        <span className="text-[12.5px] text-text-tertiary font-semibold">{league.leagueName}</span>
      </div>

      <section className="flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-live shadow-[0_0_0_3px_oklch(0.66_0.20_27/0.2)]" />
          <h2 className="m-0 font-display text-[17px] font-bold">Live Now</h2>
        </div>
        {live.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface px-6 py-8 text-center">
            <p className="m-0 text-text-secondary text-[13.5px]">No {league.leagueName} games in progress right now — check the upcoming fixtures below.</p>
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar">
            {live.map((f) => (
              <FixtureCard key={f.id} f={f} live />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="m-0 font-display text-[17px] font-bold">Upcoming {league.leagueName} Games</h2>
        {upcoming.length === 0 && <p className="text-text-tertiary text-[13.5px]">No upcoming fixtures in the feed right now — try again shortly.</p>}
        <div className="flex flex-col rounded-2xl border border-border-subtle overflow-hidden bg-surface">
          {upcoming.slice(0, 12).map((f) => (
            <FixtureRow key={f.id} f={f} />
          ))}
        </div>
      </section>

      {finished.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <h2 className="m-0 font-display text-[17px] font-bold">Recent Results</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {finished.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface border border-border-subtle">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] text-text-tertiary font-semibold">{f.leagueName}</span>
                  <span className="text-[12.5px] font-semibold truncate">
                    {f.home} <span className="text-text-tertiary">vs</span> {f.away}
                  </span>
                </div>
                <span className="nums text-[15px] font-bold flex-shrink-0">
                  {f.homeScore}&ndash;{f.awayScore}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

async function OddsPair({ f }: { f: Awaited<ReturnType<typeof getLiveFixtures>>[number] }) {
  const marketStatus = await getMarketStatus(f.id);
  const disabled = marketStatus !== "Open" || f.status === "finished";
  return (
    <div className="flex gap-1.5">
      <OddsButton matchId={f.id} matchLabel={`${f.home} vs ${f.away}`} market="Moneyline" pick="1" label={f.home} odds={f.odds.home} disabled={disabled} />
      <OddsButton matchId={f.id} matchLabel={`${f.home} vs ${f.away}`} market="Moneyline" pick="2" label={f.away} odds={f.odds.away} disabled={disabled} />
    </div>
  );
}

async function FixtureCard({ f, live }: { f: Awaited<ReturnType<typeof getLiveFixtures>>[number]; live?: boolean }) {
  return (
    <div className="flex-shrink-0 w-[280px] flex flex-col gap-3 p-4 rounded-2xl bg-surface border border-border-subtle">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-text-tertiary font-semibold">{f.leagueName}</span>
        {live && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-live/15 text-live text-[10.5px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-live" />
            {f.clock}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold truncate">{f.home}</span>
          <span className="nums text-[14px] font-bold">{f.homeScore ?? "-"}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold truncate">{f.away}</span>
          <span className="nums text-[14px] font-bold">{f.awayScore ?? "-"}</span>
        </div>
      </div>
      <OddsPair f={f} />
    </div>
  );
}

async function FixtureRow({ f }: { f: Awaited<ReturnType<typeof getLiveFixtures>>[number] }) {
  const { date, time } = kickoffLabel(f.kickoff);
  return (
    <div className="grid grid-cols-[76px_1fr] sm:grid-cols-[84px_1fr_180px] items-center gap-4 px-[18px] py-3.5 border-t border-border-subtle first:border-t-0">
      <div className="flex flex-col gap-0.5">
        <span className="text-[11.5px] font-bold text-text-secondary">{date}</span>
        <span className="nums text-[12.5px] font-semibold">{time}</span>
      </div>
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-surface-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {f.homeCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.homeCrest} alt="" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="text-[13.5px] font-semibold truncate">{f.home}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-surface-2 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {f.awayCrest && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={f.awayCrest} alt="" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="text-[13.5px] font-semibold truncate">{f.away}</span>
        </div>
      </div>
      <div className="col-span-2 sm:col-span-1">
        <OddsPair f={f} />
      </div>
    </div>
  );
}
