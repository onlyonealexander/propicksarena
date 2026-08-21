// Real live/scheduled match data, sourced from OpenLigaDB (api.openligadb.de) —
// a free, no-API-key sports data service. We deliberately use lower-division
// adult men's leagues (never youth/junior competitions) so the "small leagues
// around the world" feel is real without touching betting-on-minors territory.

export type MatchStatus = "scheduled" | "live" | "finished";

export type NormalizedMatch = {
  id: string; // `${leagueCode}-${matchID}`
  leagueCode: string;
  leagueName: string;
  country: string;
  matchday: number;
  home: string;
  away: string;
  homeCrest: string | null;
  awayCrest: string | null;
  kickoff: string; // ISO
  status: MatchStatus;
  minute: number | null;
  homeScore: number | null;
  awayScore: number | null;
  odds: { home: number; draw: number; away: number };
};

type League = { code: string; name: string; country: string };

const LEAGUES: League[] = [
  { code: "bl3", name: "3. Liga", country: "Germany" },
  { code: "bl2", name: "2. Bundesliga", country: "Germany" },
];

const OPENLIGA_BASE = "https://api.openligadb.de";

type OLMatch = {
  matchID: number;
  matchDateTimeUTC: string;
  group: { groupOrderID: number; groupName: string };
  team1: { teamName: string; teamIconUrl: string | null };
  team2: { teamName: string; teamIconUrl: string | null };
  matchIsFinished: boolean;
  matchResults: { resultTypeID: number; pointsTeam1: number; pointsTeam2: number }[];
};

function currentSeasonYear(): number {
  // German football seasons run Aug–May. If we're before August, the season
  // that "contains" today started last calendar year.
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth(); // 0-indexed, 7 = August
  return m >= 6 ? y : y - 1;
}

type TeamStat = { points: number; games: number; gf: number; ga: number };

function computeStrength(matches: OLMatch[]): Map<string, TeamStat> {
  const stats = new Map<string, TeamStat>();
  const bump = (name: string) => {
    if (!stats.has(name)) stats.set(name, { points: 0, games: 0, gf: 0, ga: 0 });
    return stats.get(name)!;
  };
  for (const m of matches) {
    if (!m.matchIsFinished) continue;
    const final = m.matchResults.find((r) => r.resultTypeID === 2);
    if (!final) continue;
    const a = bump(m.team1.teamName);
    const b = bump(m.team2.teamName);
    a.games++; b.games++;
    a.gf += final.pointsTeam1; a.ga += final.pointsTeam2;
    b.gf += final.pointsTeam2; b.ga += final.pointsTeam1;
    if (final.pointsTeam1 > final.pointsTeam2) { a.points += 3; }
    else if (final.pointsTeam1 < final.pointsTeam2) { b.points += 3; }
    else { a.points += 1; b.points += 1; }
  }
  return stats;
}

function ratingOf(stats: Map<string, TeamStat>, name: string): number {
  const s = stats.get(name);
  if (!s || s.games === 0) return 1.35; // league-average points-per-game as a neutral prior
  const ppg = s.points / s.games;
  const gdPerGame = (s.gf - s.ga) / s.games;
  return ppg + gdPerGame * 0.15;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function estimateOdds(homeRating: number, awayRating: number): { home: number; draw: number; away: number } {
  const HOME_ADV = 0.32;
  const diff = homeRating - awayRating + HOME_ADV;
  // logistic mapping of rating diff -> home win probability
  const pHomeRaw = 1 / (1 + Math.pow(10, -diff / 1.1));
  const drawBase = 0.26 - Math.abs(diff) * 0.03;
  const pDraw = Math.max(0.14, Math.min(0.3, drawBase));
  let pHome = pHomeRaw * (1 - pDraw);
  let pAway = (1 - pHomeRaw) * (1 - pDraw);
  const sum = pHome + pDraw + pAway;
  pHome /= sum; pAway /= sum;
  const pDrawNorm = pDraw / sum;

  const MARGIN = 1.07; // bookmaker overround
  const oddsHome = Math.max(1.05, round2(1 / (pHome * MARGIN)));
  const oddsDraw = Math.max(1.05, round2(1 / (pDrawNorm * MARGIN)));
  const oddsAway = Math.max(1.05, round2(1 / (pAway * MARGIN)));
  return { home: oddsHome, draw: oddsDraw, away: oddsAway };
}

function deriveStatus(m: OLMatch): { status: MatchStatus; minute: number | null } {
  if (m.matchIsFinished) return { status: "finished", minute: null };
  const kickoff = new Date(m.matchDateTimeUTC).getTime();
  const now = Date.now();
  const elapsedMin = (now - kickoff) / 60000;
  if (elapsedMin >= 0 && elapsedMin <= 115) {
    const minute = elapsedMin <= 45 ? Math.floor(elapsedMin) : elapsedMin <= 60 ? 45 : Math.min(90, Math.floor(elapsedMin - 15));
    return { status: "live", minute };
  }
  return { status: "scheduled", minute: null };
}

function currentScore(m: OLMatch): { home: number | null; away: number | null } {
  if (m.matchResults.length === 0) return { home: null, away: null };
  // Prefer the "final" result, else the latest reported partial result.
  const final = m.matchResults.find((r) => r.resultTypeID === 2);
  const best = final ?? m.matchResults[m.matchResults.length - 1];
  return { home: best.pointsTeam1, away: best.pointsTeam2 };
}

type CacheEntry = { at: number; data: NormalizedMatch[] };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 45_000;

async function fetchLeague(league: League): Promise<NormalizedMatch[]> {
  const cached = cache.get(league.code);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const season = currentSeasonYear();
  const res = await fetch(`${OPENLIGA_BASE}/getmatchdata/${league.code}/${season}`, {
    next: { revalidate: 45 },
  }).catch(() => null);
  if (!res || !res.ok) {
    const stale = cache.get(league.code);
    return stale?.data ?? [];
  }
  const raw: OLMatch[] = await res.json().catch(() => []);
  const strength = computeStrength(raw);

  const normalized: NormalizedMatch[] = raw.map((m) => {
    const { status, minute } = deriveStatus(m);
    const score = currentScore(m);
    const odds = estimateOdds(ratingOf(strength, m.team1.teamName), ratingOf(strength, m.team2.teamName));
    return {
      id: `${league.code}-${m.matchID}`,
      leagueCode: league.code,
      leagueName: league.name,
      country: league.country,
      matchday: m.group?.groupOrderID ?? 0,
      home: m.team1.teamName,
      away: m.team2.teamName,
      homeCrest: m.team1.teamIconUrl,
      awayCrest: m.team2.teamIconUrl,
      kickoff: m.matchDateTimeUTC,
      status,
      minute,
      homeScore: score.home,
      awayScore: score.away,
      odds,
    };
  });

  cache.set(league.code, { at: Date.now(), data: normalized });
  return normalized;
}

export async function getAllMatches(): Promise<NormalizedMatch[]> {
  const all = await Promise.all(LEAGUES.map(fetchLeague));
  return all.flat();
}

export async function getMatchById(id: string): Promise<NormalizedMatch | null> {
  const all = await getAllMatches();
  return all.find((m) => m.id === id) ?? null;
}

export function pickResult(m: NormalizedMatch): "1" | "X" | "2" | null {
  if (m.status !== "finished" || m.homeScore === null || m.awayScore === null) return null;
  if (m.homeScore > m.awayScore) return "1";
  if (m.homeScore < m.awayScore) return "2";
  return "X";
}

export const TRACKED_LEAGUES = LEAGUES;
