import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { settleCustomMarket, settleFinishedBets } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/custom-markets/[id]/settle">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const winningPick = String(body?.winningPick ?? "");
  if (!winningPick) return NextResponse.json({ error: "Select the winning option" }, { status: 400 });

  try {
    await settleCustomMarket(id, winningPick, admin.name);
    const result = await settleFinishedBets(admin.name);
    return NextResponse.json({ ok: true, betsSettled: result.settled });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not settle market";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
