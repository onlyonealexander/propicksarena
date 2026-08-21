import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { adminSendNotification } from "@/lib/store";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const message = String(body?.message ?? "").trim();
  const userId = body?.userId ? String(body.userId) : null;
  const all = Boolean(body?.all);

  if (!message) return NextResponse.json({ error: "Write a message first" }, { status: 400 });
  if (!all && !userId) return NextResponse.json({ error: "Choose a recipient" }, { status: 400 });

  const result = await adminSendNotification(all ? { all: true } : { userId: userId! }, message, admin.name);
  return NextResponse.json(result);
}
