import { redirect } from "next/navigation";
import { getCurrentAdmin, clearCurrentAdmin } from "@/lib/auth";
import { addAudit } from "@/lib/store";
import { AdminSidebar } from "@/components/AdminSidebar";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  OPERATIONS_ADMIN: "Operations Admin",
  FINANCE_ADMIN: "Finance Admin",
  SPORTS_ADMIN: "Sports Admin",
  SUPPORT_ADMIN: "Support Admin",
  READ_ONLY_ADMIN: "Read-Only Admin",
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  async function logout() {
    "use server";
    const current = await getCurrentAdmin();
    await clearCurrentAdmin();
    if (current) {
      await addAudit({ actor: current.name, action: "Signed out", target: "Admin Console", category: "Login" });
    }
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:grid lg:grid-cols-[240px_1fr] bg-bg">
      <AdminSidebar adminName={admin.name} role={ROLE_LABEL[admin.role] ?? admin.role} logoutAction={logout} />
      <div className="flex flex-col min-w-0">{children}</div>
    </div>
  );
}
