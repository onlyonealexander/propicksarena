import { listUsers } from "@/lib/store";
import { NotificationsClient } from "@/components/NotificationsClient";

export default async function AdminNotificationsPage({ searchParams }: PageProps<"/admin/notifications">) {
  const params = await searchParams;
  const preselect = typeof params.user === "string" ? params.user : null;
  return <NotificationsClient users={await listUsers()} preselectUserId={preselect} />;
}
