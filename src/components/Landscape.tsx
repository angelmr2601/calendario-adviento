/** Pinos, colinas de nieve y una cabaña con la luz encendida. */
const TREES: { x: number; y: number; s: number; back?: boolean }[] = [
  { x: 40, y: 150, s: 1.1, back: true },
  { x: 118, y: 158, s: 0.8, back: true },
  { x: 190, y: 146, s: 1.3, back: true },
  { x: 262, y: 160, s: 0.9, back: true },
  { x: 700, y: 154, s: 1.2, back: true },
  { x: 770, y: 162, s: 0.8, back: true },
  { x: 850, y: 148, s: 1.4, back: true },
  { x: 930, y: 158, s: 1, back: true },
  { x: 1010, y: 150, s: 1.2, back: true },
  { x: 1090, y: 160, s: 0.9, back: true },
  { x: 1160, y: 148, s: 1.3, back: true },
  { x: 90, y: 172, s: 1.7 },
  { x: 1120, y: 176, s: 1.9 },
  { x: 985, y: 182, s: 1.3 },
  { x: 240, y: 184, s: 1.2 },
];

export default function Landscape() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-1/2 z-[5] h-auto w-full min-w-[900px] -translate-x-1/2"
      viewBox="0 0 1200 230"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      <defs>
        <g id="pino">
          <path d="M0 -80 L18 -48 H8 L24 -22 H10 L30 6 H-30 L-10 -22 H-24 L-8 -48 H-18 Z" />
          <rect x="-4" y="6" width="8" height="10" />
          {/* nieve sobre las ramas */}
          <path
            d="M0 -80 L8 -66 L3 -69 L-1 -64 L-6 -68 L-8 -66z M-18 -48 L-8 -48 L-12 -43z M10 -22 L24 -22 L18 -16z"
            fill="#eef3f4"
            opacity="0.9"
          />
        </g>
        <radialGradient id="ventana" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* pinos del fondo */}
      <g fill="#0a2a1e">
        {TREES.filter((t) => t.back).map((t, i) => (
          <use
            key={i}
            href="#pino"
            transform={`translate(${t.x} ${t.y}) scale(${t.s})`}
          />
        ))}
      </g>

      {/* colina trasera */}
      <path
        d="M0 190 C140 160 260 168 380 184 C520 202 640 176 780 168 C920 160 1060 180 1200 170 V230 H0z"
        fill="#c5d5dc"
      />

      {/* cabaña */}
      <g transform="translate(590 156) scale(1.25)">
        <rect x="-34" y="0" width="68" height="40" fill="#4a2c1a" />
        <path d="M-42 2 L0 -32 L42 2z" fill="#2c1a10" />
        <path d="M-42 2 L0 -32 L42 2 L36 -2 L0 -27 L-36 -2z" fill="#f3f7f8" />
        <rect x="-8" y="12" width="16" height="16" fill="#ffd27a" />
        <path d="M0 12v16M-8 20h16" stroke="#4a2c1a" strokeWidth="1.500" />
        <rect x="14" y="-26" width="8" height="16" fill="#3a2314" />
        <rect x="13" y="-29" width="10" height="4" fill="#f3f7f8" />
        <circle cx="0" cy="20" r="38" fill="url(#ventana)" />
      </g>

      {/* colina delantera */}
      <path
        d="M0 214 C180 190 330 200 480 208 C640 217 820 190 1000 198 C1100 202 1160 196 1200 192 V230 H0z"
        fill="#f4f8f9"
      />
      <path
        d="M0 222 C200 206 360 214 520 220 C700 226 900 208 1200 214 V230 H0z"
        fill="#dbe7eb"
      />

      {/* pinos delanteros */}
      <g fill="#0f3a29">
        {TREES.filter((t) => !t.back).map((t, i) => (
          <use
            key={i}
            href="#pino"
            transform={`translate(${t.x} ${t.y}) scale(${t.s})`}
          />
        ))}
      </g>
    </svg>
  );
}
