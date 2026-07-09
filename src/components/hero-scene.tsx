/**
 * Animated sunset scene for the landing hero: a glowing sun low on the water,
 * shimmering reflection, a gently rocking boat, and drifting seagulls. Pure
 * SVG + CSS (no JS, no external asset) — see the `.hero-*` rules in globals.css.
 * A left-to-right dark scrim keeps the white headline legible. Decorative only.
 */
export function HeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#08202b" />
            <stop offset="42%" stopColor="#123a4d" />
            <stop offset="66%" stopColor="#3f4a52" />
            <stop offset="83%" stopColor="#b0603c" />
            <stop offset="100%" stopColor="#e79355" />
          </linearGradient>
          <radialGradient id="hs-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe9c6" />
            <stop offset="34%" stopColor="#ffbb63" />
            <stop offset="66%" stopColor="#f68b3c" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f68b3c" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hs-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123a4c" />
            <stop offset="100%" stopColor="#07202b" />
          </linearGradient>
          <linearGradient id="hs-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffce8a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffce8a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="1200" height="420" fill="url(#hs-sky)" />

        {/* soft warm cloud streaks near the horizon */}
        <ellipse cx="300" cy="360" rx="220" ry="9" fill="#e9975a" opacity="0.14" />
        <ellipse cx="980" cy="330" rx="180" ry="7" fill="#e9975a" opacity="0.12" />

        {/* sun glow + disc, low near the horizon on the right */}
        <circle className="hero-sun" cx="884" cy="404" r="150" fill="url(#hs-sun)" />
        <circle cx="884" cy="408" r="44" fill="#ffdca0" />

        {/* seagulls (distant "M" silhouettes drifting across the sky) */}
        <g transform="translate(0,150)">
          <g className="hero-gull hero-gull--1" fill="none" stroke="#0c2531" strokeWidth="3" strokeLinecap="round">
            <path d="M0 0 q 9 -9 18 0 q 9 -9 18 0" />
          </g>
        </g>
        <g transform="translate(0,214)">
          <g className="hero-gull hero-gull--2" fill="none" stroke="#0c2531" strokeWidth="2.4" strokeLinecap="round">
            <path d="M0 0 q 7 -7 14 0 q 7 -7 14 0" />
          </g>
        </g>
        <g transform="translate(0,110)">
          <g className="hero-gull hero-gull--3" fill="none" stroke="#0c2531" strokeWidth="2" strokeLinecap="round">
            <path d="M0 0 q 6 -6 12 0 q 6 -6 12 0" />
          </g>
        </g>

        {/* water */}
        <rect x="0" y="418" width="1200" height="182" fill="url(#hs-water)" />

        {/* shimmering sun reflection column */}
        <rect className="hero-reflect" x="846" y="418" width="76" height="182" fill="url(#hs-reflect)" />

        {/* horizontal water shimmer lines */}
        <g className="hero-shimmer" stroke="#bfe0e8" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round">
          <line x1="120" y1="452" x2="360" y2="452" />
          <line x1="620" y1="470" x2="900" y2="470" />
          <line x1="240" y1="500" x2="560" y2="500" />
          <line x1="780" y1="520" x2="1080" y2="520" />
          <line x1="80" y1="556" x2="420" y2="556" />
        </g>

        {/* boat silhouette, gently rocking on the water */}
        <g className="hero-boat">
          <ellipse cx="430" cy="433" rx="46" ry="4" fill="#04141b" opacity="0.6" />
          <path d="M393 419 L467 419 L456 432 Q430 439 404 432 Z" fill="#06181f" />
          <path d="M412 419 L412 407 L441 407 L447 419 Z" fill="#06181f" />
          <line x1="427" y1="407" x2="427" y2="390" stroke="#06181f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M429 391 L444 396 L429 401 Z" fill="#06181f" />
        </g>
      </svg>

      {/* legibility scrim */}
      <div className="hero-scrim absolute inset-0" />
    </div>
  );
}
