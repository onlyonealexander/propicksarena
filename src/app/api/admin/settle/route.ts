import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { settleFinishedBets } from "@/lib/store";

export async function POST() {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const result = await settleFinishedBets(admin.name);
  return NextResponse.json(result);
}
