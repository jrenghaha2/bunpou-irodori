interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className = 'w-9 h-9' }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="brandIrodoriBg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f766e" />
          <stop offset="55%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>
        <linearGradient id="brandIrodoriSun" x1="16" y1="13" x2="28" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#brandIrodoriBg)" />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="15"
        stroke="#ffffff"
        strokeOpacity="0.18"
        strokeWidth="2"
      />

      <circle cx="22" cy="20" r="6.5" fill="url(#brandIrodoriSun)" />

      <path
        d="M12 31.5C12 29.8 13.3 28.5 15 28.5H23C26.3 28.5 29 31.2 29 34.5V49C26.8 47.4 24.2 46.5 21.3 46.5H15C13.3 46.5 12 45.2 12 43.5V31.5Z"
        fill="#ffffff"
      />
      <path
        d="M46 31.5C46 29.8 44.7 28.5 43 28.5H35C31.7 28.5 29 31.2 29 34.5V49C31.2 47.4 33.8 46.5 36.7 46.5H43C44.7 46.5 46 45.2 46 43.5V31.5Z"
        fill="#e0e7ff"
      />

      <path
        d="M36 16.5C41.5 14 47.2 13 52 13.2"
        stroke="#34d399"
        strokeWidth="5.2"
        strokeLinecap="round"
      />
      <path
        d="M38.5 26C44 23.8 48.8 23 53 23.4"
        stroke="#fbbf24"
        strokeWidth="5.2"
        strokeLinecap="round"
      />
      <path
        d="M49.5 34.5C51.2 34.2 52.8 34.1 54 34.3"
        stroke="#38bdf8"
        strokeWidth="5.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
