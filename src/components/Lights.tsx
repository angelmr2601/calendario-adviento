const COLORS = ["#ff5a4d", "#ffc65a", "#5fd38d", "#79bdff"];
const SWAGS = 18; // suficiente para pantallas muy anchas
const SWAG_WIDTH = 150;
const BULBS = [0.17, 0.5, 0.83];

/**
 * Cable con bombillas que cuelga de arriba. Cada tramo es un SVG
 * independiente: así se centra y se recorta bien en cualquier ancho.
 */
export default function Lights() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[92px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-[-6px] flex -translate-x-1/2"
        style={{ width: SWAGS * SWAG_WIDTH }}
      >
        {Array.from({ length: SWAGS }, (_, s) => (
          <svg
            key={s}
            width={SWAG_WIDTH}
            height="92"
            viewBox={`0 0 ${SWAG_WIDTH} 92`}
            className="shrink-0 overflow-visible"
          >
            <path
              d={`M0 8 Q${SWAG_WIDTH / 2} 52 ${SWAG_WIDTH} 8`}
              fill="none"
              stroke="#07140e"
              strokeWidth="2.200"
            />
            {BULBS.map((t, b) => {
              // Punto sobre la curva cuadrática (0,8) (75,52) (150,8)
              const x = SWAG_WIDTH * t;
              const y =
                (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 52 + t * t * 8;
              const index = s * BULBS.length + b;
              const color = COLORS[index % COLORS.length];
              const tilt = (t - 0.5) * 34;

              return (
                <g
                  key={b}
                  className="light-bulb"
                  style={
                    {
                      "--c": color,
                      "--i": index,
                      transformOrigin: `${x}px ${y}px`,
                      transform: `rotate(${tilt}deg)`,
                    } as React.CSSProperties
                  }
                >
                  <rect
                    x={x - 3}
                    y={y}
                    width="6"
                    height="7"
                    rx="1"
                    fill="#0b2018"
                  />
                  <ellipse
                    className="light-glow"
                    cx={x}
                    cy={y + 17}
                    rx="14"
                    ry="14"
                    fill="var(--c)"
                    opacity="0.28"
                  />
                  <path
                    className="light-glass"
                    d={`M${x - 4.500} ${y + 6} h9 c3 3 5 7 5 11 a9.500 9.500 0 0 1 -19 0 c0 -4 2 -8 5 -11z`}
                    fill="var(--c)"
                  />
                  <ellipse
                    cx={x - 3}
                    cy={y + 15}
                    rx="1.800"
                    ry="3.200"
                    fill="#fff"
                    opacity="0.55"
                  />
                </g>
              );
            })}
          </svg>
        ))}
      </div>
    </div>
  );
}
