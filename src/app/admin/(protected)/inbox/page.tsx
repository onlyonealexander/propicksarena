import { listSupportMessages } from "@/lib/store";
import { InboxClient } from "@/components/InboxClient";

export default async function AdminInboxPage() {
  return <InboxClient messages={await listSupportMessages()} />;
}
