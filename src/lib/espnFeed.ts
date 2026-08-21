// Real live/scheduled fixtures for basketball, baseball and hockey, sourced
// from ESPN's public scoreboard endpoint (site.api.espn.com) — a free,
// keyless, widely-used feed. Same discipline as lib/sportsdata.ts: real
// teams, real scores, odds modelled from real season records — never a
// hand-picked "live" claim for a sport we can't actually back with data.

export type EspnStatus = "scheduled" | "live" | "finished";

export type EspnFixture = {
  id: string; // `${leagueSlug}-${eventId}`
  leagueSlug: string;
  leagueName: string;
  country: string;
  home: string;
  away: string;
  homeCrest: string | null;
  awayCrest: string | null;
  kickoff: string; // ISO
  status: EspnStatus;
  clock: string | null;
  homeScore: number | null;
  awayScore: number | null;
  odds: { home: number; away: number };
};

export type EspnLeague = { sportPath: string; leagueSlug: string; leagueName: string; country: string };

export const LIVE_LEAGUES: Record<string, EspnLeague> = {
  basketball: { sportPath: "basketball/wnba", leagueSlug: "wnba", leagueName: "WNBA", country: "United States" },
  baseball: { sportPath: "baseball/mlb", leagueSlug: "mlb", leagueName: "MLB", country: "United States" },
  hockey: { sportPath: "hockey/nhl", leagueSlug: "nhl", leagueName: "NHL", country: "United States / Canada" },
};

type EspnEvent = {
  id: string;
  date: string;
  competitions: {
    status: { type: { name: string; state: string; shortDetail: string } };
    competitors: {
      homeAway: "home" | "away";
      score?: string;
      team: { displayName: string; logo?: string };
      records?: { name: string; summary: string }[];
    }[];
  }[];
};

function winPct(records: { name: string; summary: string }[] | undefined): number {
  const overall = records?.find((r) => r.name === "overall")?.summary;
  if (!overall) return 0.5;
  const [w, l] = overall.split("-").map(Number);
  const total = (w ?? 0) + (l ?? 0);
  if (!total) return 0.5;
  return (w ?? 0) / total;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function estimateOdds(homeWinPct: number, awayWinPct: number): { home: number; away: number } {
  const HOME_ADV = 0.06;
  const diff = homeWinPct - awayWinPct + HOME_ADV;
  const pHomeRaw = 1 / (1 + Math.pow(10, -diff * 4));
  const MARGIN = 1.07;
  const oddsHome = Math.max(1.05, round2(1 / (pHomeRaw * MARGIN)));
  const oddsAway = Math.max(1.05, round2(1 / ((1 - pHomeRaw) * MARGIN)));
  return { home: oddsHome, away: oddsAway };
}

function mapStatus(name: string): EspnStatus {
  if (name === "STATUS_FINAL" || name === "STATUS_FULL_TIME") return "finished";
  if (name === "STATUS_SCHEDULED" || name === "STATUS_POSTPONED") return "scheduled";
  return "live";
}

const cache = new Map<string, { at: number; data: EspnFixture[] }>();
const TTL_MS = 45_000;

export async function getLiveFixtures(sportKey: string): Promise<EspnFixture[]> {
  const league = LIVE_LEAGUES[sportKey];
  if (!league) return [];

  const cached = cache.get(sportKey);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const now = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const start = fmt(now);

  // Some leagues (e.g. NHL in late summer) have nothing scheduled for
  // weeks — widen the window until we actually find fixtures rather than
  // showing an empty "nothing here" state for an in-season-later sport.
  let events: EspnEvent[] = [];
  for (const windowDays of [10, 45, 120]) {
    const end = fmt(new Date(now.getTime() + windowDays * 86400000));
    const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${league.sportPath}/scoreboard?dates=${start}-${end}`, {
      next: { revalidate: 45 },
    }).catch(() => null);
    if (!res || !res.ok) continue;
    const json = await res.json().catch(() => null);
    events = json?.events ?? [];
    if (events.length > 0) break;
  }
  if (events.length === 0) {
    return cached?.data ?? [];
  }

  const fixtures: EspnFixture[] = events
    .map((e) => {
      const comp = e.competitions[0];
      if (!comp) return null;
      const home = comp.competitors.find((c) => c.homeAway === "home");
      const away = comp.competitors.find((c) => c.homeAway === "away");
      if (!home || !away) return null;
      const status = mapStatus(comp.status.type.name);
      const odds = estimateOdds(winPct(home.records), winPct(away.records));
      return {
        id: `${league.leagueSlug}-${e.id}`,
        leagueSlug: league.leagueSlug,
        leagueName: league.leagueName,
        country: league.country,
        home: home.team.displayName,
        away: away.team.displayName,
        homeCrest: home.team.logo ?? null,
        awayCrest: away.team.logo ?? null,
        kickoff: e.date,
        status,
        clock: status === "live" ? comp.status.type.shortDetail : null,
        homeScore: home.score ? Number(home.score) : null,
        awayScore: away.score ? Number(away.score) : null,
        odds,
      } satisfies EspnFixture;
    })
    .filter((f): f is EspnFixture => f !== null);

  cache.set(sportKey, { at: Date.now(), data: fixtures });
  return fixtures;
}

export async function getLiveFixtureById(id: string): Promise<EspnFixture | null> {
  const sportKey = Object.keys(LIVE_LEAGUES).find((k) => id.startsWith(LIVE_LEAGUES[k].leagueSlug + "-"));
  if (!sportKey) return null;
  const all = await getLiveFixtures(sportKey);
  return all.find((f) => f.id === id) ?? null;
}

export function espnPickResult(f: EspnFixture): "1" | "2" | null {
  if (f.status !== "finished" || f.homeScore === null || f.awayScore === null) return null;
  return f.homeScore >= f.awayScore ? "1" : "2";
}

export const LIVE_SPORT_KEYS = Object.keys(LIVE_LEAGUES);
