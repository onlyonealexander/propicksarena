import Link from "next/link";
import { Logo } from "./Logo";
import type { SiteSettings } from "@/lib/store";

const SOCIAL_ICONS: Record<keyof SiteSettings["socials"], React.ReactNode> = {
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  ),
  twitter: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.9 2H22l-7.2 8.3L23.3 22h-6.6l-5.2-6.8L5.4 22H2.3l7.7-8.9L1 2h6.8l4.7 6.2L18.9 2Zm-1.2 18h1.7L7 4h-1.8l12.5 16Z" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3s.8-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.4.4-.2.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.8 1.8.3.2.5.1.7-.1.2-.2.8-1 1-1.3.2-.3.4-.3.7-.2.3.1 1.7.8 2 .9.3.2.5.2.6.3.1.2.1.9-.1 1.6Z" />
    </svg>
  ),
  tiktok: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 2h-3.2v13.7a2.9 2.9 0 1 1-2.5-2.9v-3.3a6.2 6.2 0 1 0 5.7 6.2V8.6a8.5 8.5 0 0 0 4.6 1.4V6.8a5.1 5.1 0 0 1-4.6-4.8Z" />
    </svg>
  ),
};

export function Footer({ settings }: { settings: SiteSettings }) {
  const socialEntries = (Object.keys(settings.socials) as (keyof SiteSettings["socials"])[]).filter((k) => settings.socials[k]);

  return (
    <footer className="w-full border-t border-border-subtle bg-sidebar mt-12">
      <div className="max-w-[1400px] w-full mx-auto px-5 sm:px-6 md:px-8 py-10 md:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
        <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start gap-3">
          <div className="flex items-center gap-2">
            <Logo size={26} />
            <span className="font-display font-bold text-[15px]">
              PROPICKS<span className="text-accent"> ARENA</span>
            </span>
          </div>
          <p className="m-0 text-[12px] text-text-tertiary leading-relaxed max-w-[260px] sm:max-w-[220px]">
            Real fixtures, real settlement, no games with your balance. Bet responsibly.
          </p>
          {socialEntries.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              {socialEntries.map((key) => (
                <a
                  key={key}
                  href={settings.socials[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={key}
                  className="w-8 h-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary hover:text-accent hover:border-accent transition-colors"
                >
                  {SOCIAL_ICONS[key]}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center sm:items-start gap-2.5">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wide">Platform</span>
          <FooterLink href="/">Home</FooterLink>
          <FooterLink href="/?sport=football#sports">Sports</FooterLink>
          <FooterLink href="/wallet">Wallet</FooterLink>
          <FooterLink href="/account?tab=history">My Bets</FooterLink>
        </div>

        <div className="flex flex-col items-center sm:items-start gap-2.5">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wide">Support</span>
          <FooterLink href="/contact">Contact Us</FooterLink>
          <FooterLink href="/signup">Create Account</FooterLink>
          <FooterLink href="/login">Log In</FooterLink>
        </div>

        <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center sm:items-start gap-2.5">
          <span className="text-[11px] font-bold text-text-tertiary uppercase tracking-wide">Get in Touch</span>
          <a href={`mailto:${settings.supportEmail}`} className="text-[12.5px] text-text-secondary hover:text-accent break-all max-w-full">
            {settings.supportEmail}
          </a>
          <a href={`tel:${settings.supportPhone.replace(/\s/g, "")}`} className="text-[12.5px] text-text-secondary hover:text-accent">
            {settings.supportPhone}
          </a>
          <span className="text-[12px] text-text-tertiary leading-relaxed max-w-[260px] sm:max-w-none">{settings.address}</span>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="max-w-[1400px] w-full mx-auto px-5 sm:px-6 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-3 text-center">
          <span className="text-[11px] text-text-tertiary">
            &copy; {new Date().getFullYear()} Propicks Arena. 18+ only.
          </span>
          <span className="text-[11px] text-text-tertiary">Please bet responsibly.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[12.5px] text-text-secondary hover:text-accent">
      {children}
    </Link>
  );
}
