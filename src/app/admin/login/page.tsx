import { redirect } from "next/navigation";
import { findAdmin, addAudit } from "@/lib/store";
import { setCurrentAdmin } from "@/lib/auth";
import { Logo } from "@/components/Logo";

async function login(formData: FormData) {
  "use server";
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const admin = await findAdmin(username, password);
  if (!admin) {
    redirect("/admin/login?error=1");
  }
  await setCurrentAdmin(admin.id);
  await addAudit({
    actor: admin.name,
    action: "Signed in",
    target: "Admin Console",
    category: "Login",
    next: `role: ${admin.role}`,
  });
  redirect("/admin");
}

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const params = await searchParams;
  const hasError = params.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm flex flex-col gap-6 p-8 rounded-2xl border border-border-subtle bg-surface">
        <div className="flex flex-col items-center gap-3">
          <Logo size={32} />
          <div className="flex flex-col items-center leading-tight">
            <span className="font-display font-bold text-lg">PROPICKS ARENA</span>
            <span className="text-[10.5px] text-text-tertiary font-bold tracking-wide uppercase">Operations Console</span>
          </div>
        </div>

        <form action={login} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] text-text-tertiary font-semibold">Username</label>
            <input name="username" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11.5px] text-text-tertiary font-semibold">Password</label>
            <input name="password" type="password" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
          </div>
          {hasError && <span className="text-xs text-negative font-semibold">Invalid username or password.</span>}
          <button className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm mt-1">Sign In</button>
        </form>

        <div className="flex flex-col gap-1 text-[11px] text-text-tertiary border-t border-border-subtle pt-4">
          <span className="font-bold text-text-secondary">Admin login</span>
          <span>admin / pro123</span>
        </div>
      </div>
    </div>
  );
}
