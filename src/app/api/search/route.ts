import { NextResponse } from "next/server";
import { getAllMatches } from "@/lib/sportsdata";
import { getLiveFixtures, LIVE_SPORT_KEYS } from "@/lib/espnFeed";
import { listOtherSportFixtures, SPORTS } from "@/lib/otherSports";
import { listCustomMarkets } from "@/lib/store";

type Result = { label: string; sub: string; href: string };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const results: Result[] = [];

  const football = await getAllMatches();
  for (const m of football) {
    if (`${m.home} ${m.away}`.toLowerCase().includes(q)) {
      results.push({ label: `${m.home} vs ${m.away}`, sub: m.leagueName, href: `/match/${m.id}` });
    }
  }

  for (const key of LIVE_SPORT_KEYS) {
    const fixtures = await getLiveFixtures(key);
    for (const f of fixtures) {
      if (`${f.home} ${f.away}`.toLowerCase().includes(q)) {
        results.push({ label: `${f.home} vs ${f.away}`, sub: f.leagueName, href: `/?sport=${key}` });
      }
    }
  }

  const otherSportIds = SPORTS.map((s) => s.id).filter((id) => id !== "football" && !LIVE_SPORT_KEYS.includes(id));
  for (const id of otherSportIds) {
    for (const f of listOtherSportFixtures(id)) {
      if (`${f.title} ${f.competition}`.toLowerCase().includes(q)) {
        results.push({ label: f.title, sub: f.competition, href: `/?sport=${id}` });
      }
    }
  }

  for (const m of await listCustomMarkets()) {
    if (m.status !== "Open") continue;
    if (`${m.title} ${m.sport}`.toLowerCase().includes(q)) {
      results.push({ label: m.title, sub: `Special · ${m.sport}`, href: `/?sport=${m.sport.toLowerCase()}#special` });
    }
  }

  return NextResponse.json({ results: results.slice(0, 8) });
}
