import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { listNotifications, unreadNotificationCount, markNotificationsRead } from "@/lib/store";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ notifications: [], unread: 0 });
  const [notifications, unread] = await Promise.all([listNotifications(userId), unreadNotificationCount(userId)]);
  return NextResponse.json({ notifications, unread });
}

export async function POST() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  await markNotificationsRead(userId);
  return NextResponse.json({ ok: true });
}
