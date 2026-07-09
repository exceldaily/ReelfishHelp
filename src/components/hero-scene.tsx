/**
 * Animated sunset scene for the landing hero: a glowing sun low on the water,
 * shimmering reflection, a gently rocking boat with a fishing rod, drifting
 * seagulls, and occasional fish splashes. Pure SVG + CSS (no JS, no external
 * asset) — see the `.hero-*` rules in globals.css. A left-to-right dark scrim
 * keeps the white headline legible. Decorative only.
 */
function Splash({ cls, x, y }: { cls: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g className={`hero-splash ${cls}`}>
        <ellipse cx="0" cy="0" rx="9" ry="2.8" fill="none" stroke="#dff1f6" strokeWidth="1.5" />
        <ellipse cx="0" cy="0" rx="4.5" ry="1.4" fill="none" stroke="#eaf6fa" strokeWidth="1.3" />
        <circle cx="-3" cy="-3" r="1.2" fill="#eaf6fa" />
        <circle cx="3" cy="-3" r="1.2" fill="#eaf6fa" />
        <circle cx="0" cy="-5" r="1" fill="#eaf6fa" />
      </g>
    </g>
  );
}

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
            <stop offset="0%" stopColor="#0c2a38" />
            <stop offset="40%" stopColor="#1a4c62" />
            <stop offset="63%" stopColor="#6b5658" />
            <stop offset="82%" stopColor="#d0703f" />
            <stop offset="100%" stopColor="#ffb267" />
          </linearGradient>
          <radialGradient id="hs-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff2d6" />
            <stop offset="34%" stopColor="#ffca7a" />
            <stop offset="66%" stopColor="#ff9a45" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ff9a45" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hs-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#175066" />
            <stop offset="100%" stopColor="#0a2a38" />
          </linearGradient>
          <linearGradient id="hs-reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffd89a" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ffd89a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect x="0" y="0" width="1200" height="420" fill="url(#hs-sky)" />

        {/* soft warm cloud streaks near the horizon */}
        <ellipse cx="300" cy="360" rx="220" ry="9" fill="#ffb877" opacity="0.18" />
        <ellipse cx="980" cy="330" rx="180" ry="7" fill="#ffb877" opacity="0.15" />

        {/* sun glow + disc, low near the horizon on the right */}
        <circle className="hero-sun" cx="884" cy="404" r="166" fill="url(#hs-sun)" />
        <circle cx="884" cy="408" r="48" fill="#ffe6b8" />

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
        <g className="hero-shimmer" stroke="#cdeaf1" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
          <line x1="120" y1="452" x2="360" y2="452" />
          <line x1="620" y1="470" x2="900" y2="470" />
          <line x1="240" y1="500" x2="560" y2="500" />
          <line x1="780" y1="520" x2="1080" y2="520" />
          <line x1="80" y1="556" x2="420" y2="556" />
        </g>

        {/* fish splashes — scattered across the water, clustered around the boat
            (staggered timers so they feel random) */}
        <Splash cls="hero-splash--1" x={210} y={486} />
        <Splash cls="hero-splash--2" x={650} y={506} />
        <Splash cls="hero-splash--3" x={980} y={470} />
        <Splash cls="hero-splash--4" x={300} y={556} />
        <Splash cls="hero-splash--5" x={360} y={452} />
        <Splash cls="hero-splash--6" x={512} y={462} />
        <Splash cls="hero-splash--7" x={440} y={498} />
        <Splash cls="hero-splash--8" x={396} y={470} />

        {/* boat silhouette with a fishing rod, gently rocking on the water */}
        <g className="hero-boat">
          <ellipse cx="430" cy="433" rx="46" ry="4" fill="#04141b" opacity="0.6" />
          <path d="M393 419 L467 419 L456 432 Q430 439 404 432 Z" fill="#06181f" />
          <path d="M412 419 L412 407 L441 407 L447 419 Z" fill="#06181f" />
          <line x1="427" y1="407" x2="427" y2="390" stroke="#06181f" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M429 391 L444 396 L429 401 Z" fill="#06181f" />
          {/* small fishing rod with the line running down into the water */}
          <line x1="446" y1="416" x2="480" y2="397" stroke="#06181f" strokeWidth="2" strokeLinecap="round" />
          <line x1="480" y1="397" x2="486" y2="423" stroke="#0c2531" strokeWidth="0.9" strokeOpacity="0.8" />
          <ellipse cx="486" cy="422" rx="4" ry="1.3" fill="none" stroke="#cdeaf1" strokeOpacity="0.5" strokeWidth="1" />
        </g>
      </svg>

      {/* legibility scrim */}
      <div className="hero-scrim absolute inset-0" />
    </div>
  );
}
