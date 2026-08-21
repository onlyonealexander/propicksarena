import { getCurrentUser } from "@/lib/auth";
import { getSiteSettings } from "@/lib/store";
import { ContactForm } from "@/components/ContactForm";
import { FaqAccordion } from "@/components/FaqAccordion";

const SUPPORT_IMAGE = "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=2400&q=70&fm=jpg&fit=crop";

export default async function ContactPage() {
  const user = await getCurrentUser();
  const settings = await getSiteSettings();

  return (
    <div className="max-w-[1100px] w-full mx-auto px-6 md:px-8 py-10 flex flex-col gap-10">
      {/* hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle min-h-[220px] flex items-center">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SUPPORT_IMAGE} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/20" />
        </div>
        <div className="relative px-8 py-9 flex flex-col gap-2.5 max-w-lg">
          <span className="inline-flex w-fit items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 text-accent text-[11px] font-bold uppercase tracking-wide">
            We&rsquo;ve Got You
          </span>
          <h1 className="m-0 font-display text-[26px] font-bold leading-tight">Talk to Propicks Arena Support</h1>
          <p className="m-0 text-text-secondary text-[13.5px] leading-relaxed">
            Deposits, withdrawals, bets, or your account — reach a real person, fast.
          </p>
        </div>
      </div>

      {/* quick contact cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <QuickCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
          }
          label="Email"
          value={settings.supportEmail}
          href={`mailto:${settings.supportEmail}`}
        />
        <QuickCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8.1 9.7a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2Z" />
            </svg>
          }
          label="Phone / WhatsApp"
          value={settings.supportPhone}
          href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
        />
        <QuickCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 3" />
            </svg>
          }
          label="Response Time"
          value="Usually a few hours"
        />
        <QuickCard
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
            </svg>
          }
          label="Responsible Gaming"
          value="Limits available on request"
        />
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="rounded-2xl border border-border-subtle bg-surface p-6">
          <span className="text-[15px] font-bold block mb-4">Send us a message</span>
          <ContactForm defaultName={user?.name} defaultEmail={user?.email} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5 p-5 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-[12.5px] font-bold">Deposits &amp; Withdrawals</span>
            <span className="text-[12px] text-text-tertiary leading-relaxed">Include your transaction reference so we can find your payment quickly.</span>
          </div>
          <div className="flex flex-col gap-1.5 p-5 rounded-2xl bg-surface border border-border-subtle">
            <span className="text-[12.5px] font-bold">Office</span>
            <span className="text-[12px] text-text-tertiary leading-relaxed">{settings.address}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="m-0 font-display text-[17px] font-bold">Frequently Asked Questions</h2>
        <FaqAccordion />
      </div>
    </div>
  );
}

function QuickCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex flex-col gap-2.5 p-[18px] rounded-2xl bg-surface border border-border-subtle h-full hover:border-accent transition-colors">
      <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10.5px] text-text-tertiary font-semibold uppercase tracking-wide">{label}</span>
        <span className="text-[12.5px] font-bold truncate">{value}</span>
      </div>
    </div>
  );
  return href ? <a href={href}>{content}</a> : content;
}
