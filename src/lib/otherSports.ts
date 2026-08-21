// Curated demo fixtures for sports beyond football. There is no free,
// keyless live-data feed for these (unlike OpenLigaDB for German football),
// so this is realistic *sample* scheduling and odds — clearly not a live
// feed. Football (lib/sportsdata.ts) stays the one sport backed by real,
// currently-updating results.

export type SportOption = { pick: string; label: string; odds: number };

export type SportFixture = {
  id: string;
  sport: string;
  competition: string;
  title: string;
  startLabel: string;
  status: "scheduled" | "finished";
  finalResult?: string; // human-readable, only set when finished
  options: SportOption[];
};

export type SportDef = { id: string; label: string; icon: string };

export const SPORTS: SportDef[] = [
  { id: "football", label: "Football", icon: "circle-dot" },
  { id: "basketball", label: "Basketball", icon: "basketball" },
  { id: "cricket", label: "Cricket", icon: "cricket" },
  { id: "hockey", label: "Hockey", icon: "hockey" },
  { id: "boxing", label: "Boxing", icon: "boxing" },
  { id: "badminton", label: "Badminton", icon: "badminton" },
  { id: "table-tennis", label: "Table Tennis", icon: "table-tennis" },
  { id: "baseball", label: "Baseball", icon: "baseball" },
  { id: "golf", label: "Golf", icon: "golf" },
  { id: "chess", label: "Chess", icon: "chess" },
];

const CATALOG: Record<string, SportFixture[]> = {
  cricket: [
    {
      id: "cricket-1",
      sport: "cricket",
      competition: "T20 Showdown",
      title: "Ironclad Strikers vs Harbor Titans",
      startLabel: "Fri, 2:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "Ironclad Strikers", odds: 1.8 },
        { pick: "2", label: "Harbor Titans", odds: 2.0 },
      ],
    },
    {
      id: "cricket-2",
      sport: "cricket",
      competition: "Metro Cup",
      title: "Coastal Warriors vs Highland Eagles",
      startLabel: "Sat, 9:00 AM",
      status: "scheduled",
      options: [
        { pick: "1", label: "Coastal Warriors", odds: 1.95 },
        { pick: "2", label: "Highland Eagles", odds: 1.85 },
      ],
    },
    {
      id: "cricket-3",
      sport: "cricket",
      competition: "Continental T20",
      title: "Rivertown Royals vs Summit Kings",
      startLabel: "Full Time",
      status: "finished",
      finalResult: "Rivertown Royals won by 6 wickets",
      options: [
        { pick: "1", label: "Rivertown Royals", odds: 1.65 },
        { pick: "2", label: "Summit Kings", odds: 2.25 },
      ],
    },
  ],
  boxing: [
    {
      id: "boxing-1",
      sport: "boxing",
      competition: "Cruiserweight Clash",
      title: "D. Osagie vs R. Kowalski",
      startLabel: "Sat, 10:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "D. Osagie", odds: 1.5 },
        { pick: "2", label: "R. Kowalski", odds: 2.6 },
      ],
    },
    {
      id: "boxing-2",
      sport: "boxing",
      competition: "Light-Heavyweight Title",
      title: "T. Mensah vs J. Bartoli",
      startLabel: "Sat, 11:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "T. Mensah", odds: 2.2 },
        { pick: "2", label: "J. Bartoli", odds: 1.65 },
      ],
    },
    {
      id: "boxing-3",
      sport: "boxing",
      competition: "Welterweight Bout",
      title: "K. Achebe vs L. Novak",
      startLabel: "Full Result",
      status: "finished",
      finalResult: "K. Achebe won by unanimous decision",
      options: [
        { pick: "1", label: "K. Achebe", odds: 1.8 },
        { pick: "2", label: "L. Novak", odds: 2.0 },
      ],
    },
  ],
  badminton: [
    {
      id: "badminton-1",
      sport: "badminton",
      competition: "Propicks Badminton Open — Quarterfinal",
      title: "R. Kessler vs A. Lindqvist",
      startLabel: "Fri, 1:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "R. Kessler", odds: 1.65 },
        { pick: "2", label: "A. Lindqvist", odds: 2.2 },
      ],
    },
    {
      id: "badminton-2",
      sport: "badminton",
      competition: "Propicks Badminton Open — Semifinal",
      title: "M. Tanaka vs O. Petrov",
      startLabel: "Sat, 3:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "M. Tanaka", odds: 1.9 },
        { pick: "2", label: "O. Petrov", odds: 1.9 },
      ],
    },
    {
      id: "badminton-3",
      sport: "badminton",
      competition: "City Indoor Cup — Final",
      title: "J. Alvarez vs K. Sundström",
      startLabel: "Full Time",
      status: "finished",
      finalResult: "J. Alvarez won 21–18, 21–15",
      options: [
        { pick: "1", label: "J. Alvarez", odds: 1.75 },
        { pick: "2", label: "K. Sundström", odds: 2.05 },
      ],
    },
  ],
  "table-tennis": [
    {
      id: "table-tennis-1",
      sport: "table-tennis",
      competition: "Propicks Table Tennis Cup",
      title: "Y. Sato vs I. Popescu",
      startLabel: "Fri, 4:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "Y. Sato", odds: 1.75 },
        { pick: "2", label: "I. Popescu", odds: 2.05 },
      ],
    },
    {
      id: "table-tennis-2",
      sport: "table-tennis",
      competition: "Propicks Table Tennis Cup",
      title: "F. Nakamura vs G. Petrescu",
      startLabel: "Fri, 5:30 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "F. Nakamura", odds: 1.6 },
        { pick: "2", label: "G. Petrescu", odds: 2.3 },
      ],
    },
    {
      id: "table-tennis-3",
      sport: "table-tennis",
      competition: "Regional Masters — Final",
      title: "E. Wallin vs C. Doyle",
      startLabel: "Full Time",
      status: "finished",
      finalResult: "E. Wallin won 4 sets to 1",
      options: [
        { pick: "1", label: "E. Wallin", odds: 1.7 },
        { pick: "2", label: "C. Doyle", odds: 2.15 },
      ],
    },
  ],
  golf: [
    {
      id: "golf-1",
      sport: "golf",
      competition: "Coastal Championship — Outright Winner",
      title: "Coastal Championship",
      startLabel: "Thu–Sun",
      status: "scheduled",
      options: [
        { pick: "hargrove", label: "D. Hargrove", odds: 6.5 },
        { pick: "whitfield", label: "L. Whitfield", odds: 8.0 },
        { pick: "okoye", label: "S. Okoye", odds: 9.0 },
        { pick: "callahan", label: "R. Callahan", odds: 11.0 },
        { pick: "marchetti", label: "T. Marchetti", odds: 15.0 },
      ],
    },
    {
      id: "golf-2",
      sport: "golf",
      competition: "Highland Masters — Outright Winner",
      title: "Highland Masters",
      startLabel: "Thu–Sun",
      status: "scheduled",
      options: [
        { pick: "obi", label: "F. Obi", odds: 7.0 },
        { pick: "lindberg", label: "H. Lindberg", odds: 7.5 },
        { pick: "delacroix", label: "M. Delacroix", odds: 10.0 },
        { pick: "ferreira", label: "P. Ferreira", odds: 12.0 },
      ],
    },
    {
      id: "golf-3",
      sport: "golf",
      competition: "Dunebrook Invitational — Outright Winner",
      title: "Dunebrook Invitational",
      startLabel: "Final",
      status: "finished",
      finalResult: "C. Redmayne won at −14",
      options: [
        { pick: "redmayne", label: "C. Redmayne", odds: 9.0 },
        { pick: "asante", label: "K. Asante", odds: 8.0 },
        { pick: "voss", label: "N. Voss", odds: 12.0 },
      ],
    },
  ],
  chess: [
    {
      id: "chess-1",
      sport: "chess",
      competition: "Grandmaster Invitational — Round 4",
      title: "V. Aslanov vs H. Lindgren",
      startLabel: "Fri, 3:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "V. Aslanov to win", odds: 2.6 },
        { pick: "X", label: "Draw", odds: 3.4 },
        { pick: "2", label: "H. Lindgren to win", odds: 2.75 },
      ],
    },
    {
      id: "chess-2",
      sport: "chess",
      competition: "Grandmaster Invitational — Round 4",
      title: "N. Voskresenskaya vs E. Barrington",
      startLabel: "Fri, 3:00 PM",
      status: "scheduled",
      options: [
        { pick: "1", label: "N. Voskresenskaya to win", odds: 2.3 },
        { pick: "X", label: "Draw", odds: 3.2 },
        { pick: "2", label: "E. Barrington to win", odds: 3.1 },
      ],
    },
    {
      id: "chess-3",
      sport: "chess",
      competition: "Grandmaster Invitational — Round 3",
      title: "D. Kowalczyk vs S. Adeyemi",
      startLabel: "Final",
      status: "finished",
      finalResult: "Draw",
      options: [
        { pick: "1", label: "D. Kowalczyk to win", odds: 2.5 },
        { pick: "X", label: "Draw", odds: 3.3 },
        { pick: "2", label: "S. Adeyemi to win", odds: 2.9 },
      ],
    },
  ],
};

export function listOtherSportFixtures(sportId: string): SportFixture[] {
  return CATALOG[sportId] ?? [];
}

export function getOtherSportFixture(fixtureId: string): SportFixture | null {
  for (const fixtures of Object.values(CATALOG)) {
    const f = fixtures.find((x) => x.id === fixtureId);
    if (f) return f;
  }
  return null;
}

// pick that actually won, for every fixture already marked "finished" above —
// consumed by store.settleFinishedBets() so settlement is generic across
// every sport, not just football.
export const OTHER_SPORTS_RESULTS: Record<string, string> = Object.fromEntries(
  Object.values(CATALOG)
    .flat()
    .filter((f) => f.status === "finished")
    .map((f) => {
      // the winning option is whichever one the finalResult text names first;
      // encoded directly per fixture to keep it unambiguous
      const winners: Record<string, string> = {
        "cricket-3": "1",
        "boxing-3": "1",
        "badminton-3": "1",
        "table-tennis-3": "1",
        "golf-3": "redmayne",
        "chess-3": "X",
      };
      return [f.id, winners[f.id]];
    })
);
