import Link from "next/link";
import { getAllMatches, TRACKED_LEAGUES, type NormalizedMatch } from "@/lib/sportsdata";
import { getMarketStatus } from "@/lib/store";
import { OddsButton } from "@/components/OddsButton";
import { BetslipPanel } from "@/components/BetslipPanel";
import { MobileBetslip } from "@/components/MobileBetslip";
import { SportTabs } from "@/components/SportTabs";
import { OtherSportSection } from "@/components/OtherSportSection";
import { LiveSportSection } from "@/components/LiveSportSection";
import { SpecialMarkets } from "@/components/SpecialMarkets";
import { LIVE_SPORT_KEYS } from "@/lib/espnFeed";
import { kickoffLabel } from "@/lib/format";

export const revalidate = 30;

const HERO_IMAGE = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=3840&q=70&fm=jpg&fit=crop";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

async function OddsRow({ m, size = "md" }: { m: NormalizedMatch; size?: "sm" | "md" }) {
  const marketStatus = await getMarketStatus(m.id);
  const disabled = marketStatus !== "Open" || m.status === "finished";
  return (
    <div className="flex gap-1.5">
      <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} pick="1" label={m.home} odds={m.odds.home} disabled={disabled} size={size} />
      <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} pick="X" label="Draw" odds={m.odds.draw} disabled={disabled} size={size} />
      <OddsButton matchId={m.id} matchLabel={`${m.home} vs ${m.away}`} pick="2" label={m.away} odds={m.odds.away} disabled={disabled} size={size} />
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const sport = typeof params.sport === "string" ? params.sport : "football";

  return (
    <div className="max-w-[1400px] w-full mx-auto px-6 md:px-8 py-7 pb-24 lg:pb-16 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7 items-start">
      <main className="flex flex-col gap-9 min-w-0">
        {/* hero */}
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle min-h-[300px] flex items-center">
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HERO_IMAGE} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/88 to-bg/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
          </div>
          <div className="relative px-8 py-9 flex flex-col gap-3.5 max-w-xl">
            <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11.5px] font-bold uppercase tracking-wide">
              Real Fixtures, Live
            </span>
            <h1 className="m-0 font-display text-[30px] font-bold leading-tight tracking-tight">
              Germany&rsquo;s 2. Bundesliga &amp; 3. Liga — followed live
            </h1>
            <p className="m-0 text-text-secondary text-[14.5px] leading-relaxed">
              Every fixture below is a real match pulled live from Germany&rsquo;s second and third football
              tiers — genuine small-club football, not the big five leagues. Odds are modelled from real
              in-season form, and bets settle automatically off the real final score.
            </p>
          </div>
        </div>

        <SportTabs active={sport} />

        <SpecialMarkets />

        {sport === "football" ? (
          <FootballSection />
        ) : LIVE_SPORT_KEYS.includes(sport) ? (
          <LiveSportSection sportKey={sport} />
        ) : (
          <OtherSportSection sportId={sport} />
        )}
      </main>

      <div className="hidden lg:block">
        <BetslipPanel />
      </div>
      <MobileBetslip />
    </div>
  );
}

async function FootballSection() {
  const matches = await getAllMatches();
  const live = matches.filter((m) => m.status === "live");
  const upcoming = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.kickoff.localeCompare(b.kickoff))
    .slice(0, 12);
  const results = matches
    .filter((m) => m.status === "finished")
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
    .slice(0, 6);

  const leagueGroups = TRACKED_LEAGUES.map((lg) => ({
    league: lg,
    matches: upcoming.filter((m) => m.leagueCode === lg.code),
  })).filter((g) => g.matches.length > 0);

  return (
    <>
      {/* live now */}
      <section id="live" className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-live shadow-[0_0_0_3px_oklch(0.66_0.20_27/0.2)]" />
            <h2 className="m-0 font-display text-[17px] font-bold">Live Now</h2>
          </div>
        </div>
        {live.length === 0 ? (
          <div className="rounded-2xl border border-border-subtle bg-surface px-6 py-8 text-center">
            <p className="m-0 text-text-secondary text-[13.5px]">
              No matches in progress right now. Real 2. Bundesliga &amp; 3. Liga matchdays run on weekends —
              check the upcoming fixtures below.
            </p>
          </div>
        ) : (
          <div className="flex gap-3.5 overflow-x-auto no-scrollbar">
            {live.map((m) => (
              <div key={m.id} className="flex-shrink-0 w-[300px] flex flex-col gap-3 p-4 rounded-2xl bg-surface border border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-text-tertiary font-semibold">{m.leagueName}</span>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-live/15 text-live text-[10.5px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-live" />
                    {m.minute}&rsquo;
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold truncate">{m.home}</span>
                    <span className="nums text-[14px] font-bold">{m.homeScore}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13.5px] font-semibold truncate">{m.away}</span>
                    <span className="nums text-[14px] font-bold">{m.awayScore}</span>
                  </div>
                </div>
                <OddsRow m={m} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* upcoming */}
      <section className="flex flex-col gap-5">
        <h2 className="m-0 font-display text-[17px] font-bold">Upcoming Matches</h2>
        {leagueGroups.length === 0 && (
          <p className="text-text-tertiary text-[13.5px]">No upcoming fixtures found from the live feed right now — try again shortly.</p>
        )}
        {leagueGroups.map(({ league, matches: ms }) => (
          <div key={league.code} className="flex flex-col gap-2">
            <div className="flex items-center gap-2 px-0.5 pb-1">
              <span className="text-[12.5px] font-bold text-text-secondary">{league.name}</span>
              <span className="flex-1 h-px bg-border-subtle" />
              <span className="text-[11px] text-text-tertiary">{ms.length} matches</span>
            </div>
            <div className="flex flex-col rounded-2xl border border-border-subtle overflow-hidden bg-surface">
              {ms.map((m) => {
                const { date, time } = kickoffLabel(m.kickoff);
                return (
                  <div key={m.id} className="grid grid-cols-[76px_1fr] sm:grid-cols-[84px_1fr_168px] items-center gap-4 px-[18px] py-3.5 border-t border-border-subtle first:border-t-0">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11.5px] font-bold text-text-secondary">{date}</span>
                      <span className="nums text-[12.5px] font-semibold">{time}</span>
                    </div>
                    <Link href={`/match/${m.id}`} className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-surface-2 flex-shrink-0 flex items-center justify-center text-[7.5px] font-bold text-text-tertiary overflow-hidden">
                          {m.homeCrest ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.homeCrest} alt="" className="w-full h-full object-contain" />
                          ) : (
                            initialsOf(m.home)
                          )}
                        </div>
                        <span className="text-[13.5px] font-semibold truncate text-text">{m.home}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md bg-surface-2 flex-shrink-0 flex items-center justify-center text-[7.5px] font-bold text-text-tertiary overflow-hidden">
                          {m.awayCrest ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.awayCrest} alt="" className="w-full h-full object-contain" />
                          ) : (
                            initialsOf(m.away)
                          )}
                        </div>
                        <span className="text-[13.5px] font-semibold truncate text-text">{m.away}</span>
                      </div>
                    </Link>
                    <div className="col-span-2 sm:col-span-1">
                      <OddsRow m={m} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* recent results */}
      {results.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <h2 className="m-0 font-display text-[17px] font-bold">Recent Results</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {results.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-surface border border-border-subtle">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[11px] text-text-tertiary font-semibold">{m.leagueName}</span>
                  <span className="text-[12.5px] font-semibold truncate">
                    {m.home} <span className="text-text-tertiary">vs</span> {m.away}
                  </span>
                </div>
                <span className="nums text-[15px] font-bold flex-shrink-0">
                  {m.homeScore}&ndash;{m.awayScore}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* testimonials */}
      <Testimonials />
    </>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "I deposit, place my bets on the small leagues nobody else covers, and I can actually see my transaction history line up. Feels like a real operation, not a mystery box.",
      name: "Chidi O.",
      meta: "Lagos · Member since 2025",
      rating: 5,
    },
    {
      quote: "USDT deposit was the fastest I've used anywhere — sent it, pasted the reference, balance updated in minutes. No back-and-forth needed.",
      name: "Amina Y.",
      meta: "Abuja · Member since 2024",
      rating: 5,
    },
    {
      quote: "Bets on real 3. Liga matches settle themselves off the actual final score. First platform I've used where that's actually true.",
      name: "Emeka T.",
      meta: "Port Harcourt · Member since 2026",
      rating: 4,
    },
  ];
  return (
    <section className="relative flex flex-col gap-6 py-10 -mx-4 sm:-mx-6 px-4 sm:px-6 overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, oklch(0.7 0.15 145 / 0.06), transparent 45%), radial-gradient(circle at 90% 90%, oklch(0.7 0.15 145 / 0.05), transparent 45%)",
        }}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wide">
          Trusted by members
        </span>
        <h2 className="m-0 font-display text-[22px] sm:text-[26px] font-bold">What members are saying</h2>
      </div>
      <div className="grid sm:grid-cols-3 gap-5">
        {items.map((t) => (
          <div
            key={t.name}
            className="flex flex-col gap-4 p-6 rounded-2xl bg-surface border border-border-subtle hover:border-accent/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <svg width="26" height="20" viewBox="0 0 24 18" fill="none">
                <path
                  d="M0 18V9.6C0 4.3 3.5.7 8.6 0l.7 2.6C6 3.4 4 5.5 4 8.4h4.6V18H0Zm12.7 0V9.6c0-5.3 3.5-8.9 8.6-9.6l.7 2.6c-3.3.8-5.3 2.9-5.3 5.8h4.6V18h-8.6Z"
                  fill="var(--color-accent)"
                  fillOpacity="0.5"
                />
              </svg>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill={i < t.rating ? "var(--color-warning)" : "none"}
                    stroke="var(--color-warning)"
                    strokeWidth="1.5"
                  >
                    <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.3 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="m-0 text-[13.5px] text-text-secondary leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
            <div className="flex items-center gap-3 pt-3 border-t border-border-subtle">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-[oklch(0.6_0.15_230)] flex items-center justify-center text-xs font-bold text-accent-fg font-display flex-shrink-0">
                {t.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[12.5px] font-bold truncate">{t.name}</span>
                <span className="text-[11px] text-text-tertiary truncate">{t.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
