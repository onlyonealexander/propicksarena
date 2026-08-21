import Link from "next/link";
import { redirect } from "next/navigation";
import { setCurrentUserId } from "@/lib/auth";
import { verifyCredentials, addAudit } from "@/lib/store";
import { Logo } from "@/components/Logo";

const AUTH_IMAGE = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=2000&q=70&fm=jpg&fit=crop";

async function login(formData: FormData) {
  "use server";
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const user = await verifyCredentials(identifier, password);
  if (!user) {
    redirect(`/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await setCurrentUserId(user.id);
  await addAudit({ actor: user.name, action: "Signed in", target: "Propicks Arena", category: "Login" });
  redirect(next && next.startsWith("/") ? next : "/");
}

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const hasError = params.error === "1";
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden lg:block relative flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUTH_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12 gap-3 max-w-md">
          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wide">
            Welcome Back
          </span>
          <h2 className="m-0 font-display text-[28px] font-bold leading-tight">Your bets, your balance, always in view.</h2>
          <p className="m-0 text-text-secondary text-[13.5px] leading-relaxed">
            Sign in to place bets, track your wallet, and see every settlement the moment it happens.
          </p>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-6 py-16 relative overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, oklch(0.7 0.15 145 / 0.08), transparent 40%), radial-gradient(circle at 85% 80%, oklch(0.7 0.15 145 / 0.06), transparent 45%)",
        }}
      >
        <svg className="absolute -right-16 -bottom-16 opacity-[0.06] pointer-events-none" width="340" height="340" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="0.6">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <svg className="absolute -left-10 top-10 opacity-[0.05] pointer-events-none" width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="0.6">
          <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" />
        </svg>
        <div className="w-full max-w-sm flex flex-col gap-6 relative">
          <div className="flex flex-col items-center gap-3">
            <Logo size={36} />
            <h1 className="m-0 font-display text-xl font-bold">Welcome back</h1>
            <p className="m-0 text-[12.5px] text-text-tertiary text-center">Sign in to Propicks Arena to place bets and manage your wallet.</p>
          </div>
          <form action={login} className="flex flex-col gap-3.5">
            <input type="hidden" name="next" value={next} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] text-text-tertiary font-semibold">Username or Email</label>
              <input name="identifier" required autoFocus className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] text-text-tertiary font-semibold">Password</label>
              <input name="password" type="password" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
            </div>
            {hasError && <span className="text-xs text-negative font-semibold">Incorrect username/email or password.</span>}
            <button className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm mt-1">Log In</button>
          </form>
          <p className="m-0 text-center text-[12.5px] text-text-secondary">
            New here?{" "}
            <Link href="/signup" className="font-bold text-accent">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
