/**
 * Custom logomark: a chevron ("V", for Voyager) inside a thin orbit ring,
 * filled with the same gradient family as the voice orb for one cohesive
 * visual system. Inline SVG (no emoji, no external asset request, crisp
 * at any size, matches the theme colors exactly).
 */
export default function Logo({ size = 26 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logoMark" x1="4" y1="8" x2="28" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--c1)" />
          <stop offset="55%" stopColor="var(--c2)" />
          <stop offset="100%" stopColor="var(--c3)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14.5" stroke="url(#logoMark)" strokeOpacity="0.35" strokeWidth="1.4" />
      <path
        d="M9 10L16 22L23 10"
        stroke="url(#logoMark)"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
