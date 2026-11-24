import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
} as const;

export function Star(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
    </svg>
  );
}

export function Holly(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M11 11C9 6.5 5 5 1.5 7c1 4.6 5.4 6.6 9.5 4z" />
      <path d="M13 11c2-4.5 6-6 9.500-4-1 4.600-5.400 6.600-9.500 4z" />
      <circle cx="12" cy="14.200" r="2.100" />
      <circle cx="9.600" cy="16.800" r="1.900" />
      <circle cx="14.400" cy="16.800" r="1.900" />
    </svg>
  );
}

export function Tree(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M12 1.500l4.600 6.500h-2.600l4.400 6.200h-3.400L20 20.500h-6.200V23h-3.600v-2.500H4l5-6.300H5.600L10 8H7.400z" />
    </svg>
  );
}

export function Snowflake(props: IconProps) {
  return (
    <svg
      {...base}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <path d="M12 2v20M3.300 7l17.400 10M3.300 17L20.700 7" />
      <path d="M9.500 3.800L12 6.300l2.500-2.500M9.500 20.200L12 17.700l2.500 2.500" />
    </svg>
  );
}

export function Cane(props: IconProps) {
  return (
    <svg {...base} fill="none" strokeLinecap="round" {...props}>
      <path
        d="M8.500 22V8.500a3.800 3.800 0 117.600 0"
        stroke="currentColor"
        strokeWidth="3.600"
      />
      <path
        d="M8.500 22V8.500a3.800 3.800 0 117.600 0"
        stroke="#fbeed1"
        strokeWidth="3.600"
        strokeLinecap="butt"
        strokeDasharray="2.200 3.300"
        opacity="0.85"
      />
    </svg>
  );
}

export function Bauble(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <rect x="9.500" y="1.500" width="5" height="3.500" rx="0.800" />
      <circle cx="12" cy="14" r="8" />
      <path
        d="M7.500 12.500c.6-2.200 2.200-3.600 4-3.900"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="1.400"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Heart(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <path d="M12 21s-7.600-4.700-9.500-9.400C1.300 8.300 3.200 5 6.500 5c2 0 3.500 1.100 5.500 3.200C13.900 6.100 15.400 5 17.500 5c3.300 0 5.200 3.300 4 6.600C19.600 16.300 12 21 12 21z" />
    </svg>
  );
}

export function Lock(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" {...props}>
      <rect x="4.500" y="10.500" width="15" height="11" rx="2" />
      <path
        d="M8 10.500V8a4 4 0 118 0v2.500"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.200"
      />
    </svg>
  );
}

/** Lazo de regalo, dibujado a mano con curvas simples. */
export function Bow(props: IconProps) {
  return (
    <svg viewBox="0 0 64 44" aria-hidden focusable={false} {...props}>
      <path
        d="M32 28C22 28 6 24 5 13 4 4 17 2 25 10c4 4 6 12 7 18z"
        fill="currentColor"
      />
      <path
        d="M32 28c10 0 26-4 27-15C60 4 47 2 39 10c-4 4-6 12-7 18z"
        fill="currentColor"
      />
      <path
        d="M14 11c4 0 9 4 13 11M50 11c-4 0-9 4-13 11"
        fill="none"
        stroke="#000"
        strokeOpacity="0.18"
        strokeWidth="1.600"
        strokeLinecap="round"
      />
      <path
        d="M30 28L21 43h7l4-9 4 9h7l-9-15z"
        fill="currentColor"
        opacity="0.9"
      />
      <rect x="27" y="22" width="10" height="9" rx="3" fill="currentColor" />
      <rect
        x="27"
        y="22"
        width="10"
        height="9"
        rx="3"
        fill="#000"
        fillOpacity="0.12"
      />
    </svg>
  );
}

/** Ramita de acebo para separadores. */
export function Sprig(props: IconProps) {
  return (
    <svg viewBox="0 0 120 28" aria-hidden focusable={false} {...props}>
      <path
        d="M4 14h40M76 14h40"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1.200"
        strokeLinecap="round"
        strokeDasharray="1 4"
      />
      <g fill="#2f7a53">
        <path d="M59 14C55 6 47 4 42 8c2 8 10 11 17 6z" />
        <path d="M61 14c4-8 12-10 17-6-2 8-10 11-17 6z" />
      </g>
      <g fill="#c93a40">
        <circle cx="60" cy="16" r="3.200" />
        <circle cx="55.500" cy="19.500" r="2.800" />
        <circle cx="64.500" cy="19.500" r="2.800" />
      </g>
    </svg>
  );
}

export const DOOR_ORNAMENTS = [Star, Holly, Tree, Snowflake, Cane, Bauble] as const;
