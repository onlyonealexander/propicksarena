import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { markSupportMessage } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/support/[id]">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!["New", "Read", "Replied"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  await markSupportMessage(id, status, admin.name);
  return NextResponse.json({ ok: true });
}
