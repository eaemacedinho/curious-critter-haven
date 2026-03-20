export default function VerifiedBadge({ size = 20 }: { size?: number }) {
  const id = `vb-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="inline-block flex-shrink-0"
      style={{ filter: `drop-shadow(0 0 ${size * 0.25}px hsl(220 80% 60% / 0.5))` }}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(220, 85%, 60%)" />
          <stop offset="50%" stopColor="hsl(240, 75%, 55%)" />
          <stop offset="100%" stopColor="hsl(260, 80%, 58%)" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="4" y1="2" x2="16" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      {/* Star / badge shape */}
      <path
        d="M12 1.5l2.39 3.27L18.18 4l.77 3.89L22.5 10.5l-2.17 3.04.38 3.96-3.71 1.36L15.18 22.5 12 20.76 8.82 22.5 7.02 18.86l-3.71-1.36.38-3.96L1.5 10.5l3.55-2.61L5.82 4l3.79.77L12 1.5z"
        fill={`url(#${id}-bg)`}
      />
      {/* Shine overlay */}
      <path
        d="M12 1.5l2.39 3.27L18.18 4l.77 3.89L22.5 10.5l-2.17 3.04.38 3.96-3.71 1.36L15.18 22.5 12 20.76 8.82 22.5 7.02 18.86l-3.71-1.36.38-3.96L1.5 10.5l3.55-2.61L5.82 4l3.79.77L12 1.5z"
        fill={`url(#${id}-shine)`}
      />
      {/* Checkmark */}
      <path
        d="M8.5 12.5l2.2 2.2 4.8-4.8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
