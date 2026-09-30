interface LogoProps {
  className?: string
}

/** Zincir halkası logosu (public/favicon.svg ile aynı çizim). */
export function Logo({ className = 'size-8' }: LogoProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-emerald-600" />
      <g
        fill="none"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M13.5 18.5l5-5" />
        <path d="M15 11.5l1.4-1.4a4.2 4.2 0 0 1 6 6L21 17.5" />
        <path d="M17 20.5l-1.4 1.4a4.2 4.2 0 0 1-6-6L11 14.5" />
      </g>
    </svg>
  )
}
