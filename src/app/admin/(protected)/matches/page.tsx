import { getAllMatches, TRACKED_LEAGUES } from "@/lib/sportsdata";
import { listMarketOverrides } from "@/lib/store";
import { MatchesClient } from "@/components/MatchesClient";

export default async function AdminMatchesPage() {
  const matches = await getAllMatches();
  const overrides = await listMarketOverrides();

  const groups = TRACKED_LEAGUES.map((lg) => {
    const leagueMatches = matches.filter((m) => m.leagueCode === lg.code);
    const live = leagueMatches.filter((m) => m.status === "live");
    const upcoming = leagueMatches
      .filter((m) => m.status === "scheduled")
      .sort((a, b) => a.kickoff.localeCompare(b.kickoff))
      .slice(0, 8);
    const finished = leagueMatches
      .filter((m) => m.status === "finished")
      .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
      .slice(0, 4);
    return { league: lg, matches: [...live, ...upcoming, ...finished] };
  });

  return <MatchesClient groups={groups} overrides={overrides} />;
}
