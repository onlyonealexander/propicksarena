import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminReviewTransaction } from "@/lib/store";

export async function POST(request: Request, ctx: RouteContext<"/api/admin/transactions/[id]">) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "approve" && decision !== "reject") {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  try {
    const tx = await adminReviewTransaction(id, decision, admin.name);
    return NextResponse.json({ transaction: tx });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update transaction";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
