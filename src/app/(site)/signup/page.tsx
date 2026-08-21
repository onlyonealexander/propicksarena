import Link from "next/link";
import { redirect } from "next/navigation";
import { setCurrentUserId } from "@/lib/auth";
import { createUser } from "@/lib/store";
import { Logo } from "@/components/Logo";

const AUTH_IMAGE = "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=2000&q=70&fm=jpg&fit=crop";

async function signup(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const fail = (reason: string) => redirect(`/signup?error=${encodeURIComponent(reason)}`);

  if (!name || !username || !email || !phone || !password) fail("Please fill in every field.");
  if (password.length < 6) fail("Password must be at least 6 characters.");
  if (password !== confirm) fail("Passwords don't match.");

  try {
    const user = await createUser({ name, username, email, phone, password });
    await setCurrentUserId(user.id);
  } catch (err) {
    fail(err instanceof Error ? err.message : "Could not create your account.");
    return;
  }
  redirect("/");
}

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden lg:block relative flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AUTH_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/40 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-12 gap-3 max-w-md">
          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wide">
            Join Free
          </span>
          <h2 className="m-0 font-display text-[28px] font-bold leading-tight">Real fixtures. Real settlement. Your money, tracked properly.</h2>
          <p className="m-0 text-text-secondary text-[13.5px] leading-relaxed">
            No card required to sign up — fund your account whenever you&rsquo;re ready.
          </p>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden"
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
        <div className="w-full max-w-md flex flex-col gap-6 relative">
          <div className="flex flex-col items-center gap-3">
            <Logo size={36} />
            <h1 className="m-0 font-display text-xl font-bold">Create your account</h1>
            <p className="m-0 text-[12.5px] text-text-tertiary text-center">Join Propicks Arena in under a minute.</p>
          </div>
          <form action={signup} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] text-text-tertiary font-semibold">Full Name</label>
              <input name="name" required autoFocus className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] text-text-tertiary font-semibold">Username</label>
                <input name="username" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] text-text-tertiary font-semibold">Phone (with country code)</label>
                <input name="phone" required placeholder="+44 7911 123456" className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
              </div>
            </div>
            <span className="-mt-2 text-[10.5px] text-text-tertiary">We set your display currency from your phone&rsquo;s country code.</span>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11.5px] text-text-tertiary font-semibold">Email</label>
              <input name="email" type="email" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] text-text-tertiary font-semibold">Password</label>
                <input name="password" type="password" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11.5px] text-text-tertiary font-semibold">Confirm</label>
                <input name="confirm" type="password" required className="px-3.5 py-3 rounded-lg border border-border bg-surface-2 text-[13px] outline-none focus:border-accent" />
              </div>
            </div>
            {error && <span className="text-xs text-negative font-semibold">{error}</span>}
            <label className="flex items-start gap-2 text-[11.5px] text-text-tertiary">
              <input type="checkbox" required className="mt-0.5" />
              I confirm I&rsquo;m 18 or older and agree to the betting rules &amp; terms.
            </label>
            <button className="w-full py-3.5 rounded-lg bg-accent text-accent-fg font-extrabold text-sm mt-1">Create Account</button>
          </form>
          <p className="m-0 text-center text-[12.5px] text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-accent">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
