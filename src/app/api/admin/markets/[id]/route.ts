import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { setMarketStatus } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/markets/[id]">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  const matchLabel = String(body?.matchLabel ?? id);
  if (!["Open", "Suspended", "Closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await setMarketStatus(id, status, admin.name, matchLabel);
  return NextResponse.json({ ok: true });
}
