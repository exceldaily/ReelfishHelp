/**
 * Decorative fishing line-art for page headers and empty corners. All pieces
 * are stroke-based SVGs drawn in `currentColor`, so pages tint them with a
 * text-* class (usually text-tide-200 so they sit quietly behind content).
 * Purely cosmetic: aria-hidden + pointer-events-none everywhere.
 */

type DecorProps = { className?: string };

/** A bent rod with reel, line arcing down to a hook. Hero piece for /gear. */
export function RodDecor({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden className={`pointer-events-none ${className ?? ""}`}>
      {/* rod blank, loaded up */}
      <path d="M18 188 Q92 118 148 42" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* grip */}
      <path d="M24 182 L44 162" stroke="currentColor" strokeWidth="8" strokeLinecap="round" opacity="0.7" />
      {/* reel + crank */}
      <circle cx="52" cy="168" r="9" stroke="currentColor" strokeWidth="3" />
      <circle cx="52" cy="168" r="2.5" fill="currentColor" />
      <path d="M61 172 l7 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* line guides */}
      <path d="M96 116 l6 6 M122 82 l5 5 M143 52 l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* line from the tip down into the corner */}
      <path d="M148 42 C176 78 172 118 164 148" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 6" />
      {/* hook */}
      <path d="M164 148 c1 10 -1 17 -8 19 c-7 2 -12 -3 -11 -9 c1 -5 6 -7 9 -5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M154 153 l-4 -3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** A single J-hook with a knotted eye. */
export function HookDecor({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 120 160" fill="none" aria-hidden className={`pointer-events-none ${className ?? ""}`}>
      {/* eye */}
      <circle cx="62" cy="18" r="7" stroke="currentColor" strokeWidth="3.5" />
      {/* shank down + clean J bend, point rising on the left */}
      <path d="M62 25 L62 92 C62 120 30 120 30 92 L30 70" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* barb */}
      <path d="M30 70 l9 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      {/* trailing line above the eye */}
      <path d="M62 11 C60 4 66 0 70 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" />
    </svg>
  );
}

/** A spoon lure with a swivel ring and treble hook. */
export function LureDecor({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 120 180" fill="none" aria-hidden className={`pointer-events-none ${className ?? ""}`}>
      {/* swivel ring */}
      <circle cx="60" cy="14" r="6" stroke="currentColor" strokeWidth="3" />
      {/* spoon body */}
      <path d="M60 22 C82 42 86 78 72 104 C66 115 54 115 48 104 C34 78 38 42 60 22 Z" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" />
      {/* shine line */}
      <path d="M58 38 C52 56 52 78 57 92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* split ring */}
      <circle cx="60" cy="118" r="5" stroke="currentColor" strokeWidth="2.5" />
      {/* treble hook */}
      <path d="M60 123 L60 142 M60 142 c-2 10 -14 12 -18 4 M60 142 c2 10 14 12 18 4 M60 142 c0 11 -4 16 -8 17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** A bobber sitting on ripple rings. */
export function BobberDecor({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 140 140" fill="none" aria-hidden className={`pointer-events-none ${className ?? ""}`}>
      {/* stem */}
      <path d="M70 22 L70 34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="70" cy="18" r="4" stroke="currentColor" strokeWidth="2.5" />
      {/* float */}
      <circle cx="70" cy="58" r="24" stroke="currentColor" strokeWidth="3.5" />
      <path d="M46 58 L94 58" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="70" cy="49" r="3" fill="currentColor" opacity="0.6" />
      {/* ripples */}
      <path d="M30 96 Q50 88 70 96 T110 96" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M42 112 Q56 106 70 112 T98 112" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** A short horizontal wave rule, for under section headings. */
export function WaveRule({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 160 14" fill="none" aria-hidden className={`pointer-events-none ${className ?? ""}`}>
      <path
        d="M2 8 Q12 2 22 8 T42 8 T62 8 T82 8 T102 8 T122 8 T142 8 T162 8"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
