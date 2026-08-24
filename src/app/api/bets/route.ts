import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { placeBet, type Selection } from "@/lib/store";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in to place a bet" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.selections) || typeof body.stake !== "number") {
    return NextResponse.json({ error: "Malformed request" }, { status: 400 });
  }

  const selections: Selection[] = body.selections.map((s: Selection) => ({
    matchId: String(s.matchId),
    matchLabel: String(s.matchLabel),
    league: String(s.league ?? "Sports"),
    market: String(s.market ?? "Match Winner"),
    pick: String(s.pick),
    label: String(s.label),
    odds: Number(s.odds),
  }));

  try {
    const bet = await placeBet(userId, selections, Number(body.stake));
    return NextResponse.json({ bet });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not place bet";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
