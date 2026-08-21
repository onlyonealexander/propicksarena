import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { setCustomMarketStatus } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/custom-markets/[id]/status">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!["Open", "Suspended", "Closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    await setCustomMarketStatus(id, status, admin.name);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update market";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
