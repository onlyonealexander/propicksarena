import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { changePassword } from "@/lib/store";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in first" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currentPassword = String(body?.currentPassword ?? "");
  const newPassword = String(body?.newPassword ?? "");
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Fill in both fields" }, { status: 400 });
  }

  const result = await changePassword(userId, currentPassword, newPassword);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
