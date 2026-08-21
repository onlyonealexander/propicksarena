import { listAudit } from "@/lib/store";
import { AuditClient } from "@/components/AuditClient";

export default async function AdminAuditPage() {
  return <AuditClient entries={await listAudit()} />;
}
