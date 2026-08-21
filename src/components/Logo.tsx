export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="pa-logo-fill" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.72 0.135 195)" />
          <stop offset="100%" stopColor="oklch(0.52 0.13 220)" />
        </linearGradient>
      </defs>
      {/* shield */}
      <path
        d="M20 2.5 L35 8 V19 C35 28.5 29 34.5 20 37.5 C11 34.5 5 28.5 5 19 V8 Z"
        fill="url(#pa-logo-fill)"
      />
      <path
        d="M20 2.5 L35 8 V19 C35 28.5 29 34.5 20 37.5 C11 34.5 5 28.5 5 19 V8 Z"
        stroke="oklch(0.16 0.01 260)"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      {/* monogram P built from a goalpost / arena arch motif */}
      <path
        d="M15.5 27V13.5H21.2C23.7 13.5 25.6 15.2 25.6 17.7C25.6 20.2 23.7 21.9 21.2 21.9H17.9V27"
        stroke="oklch(0.14 0.014 260)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* rising accent tick */}
      <path d="M27 24.5L29.6 20L32.2 22.4" stroke="oklch(0.14 0.014 260)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}
