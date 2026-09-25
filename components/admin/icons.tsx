import type { ReactNode } from "react";

type IconProps = { className?: string };

function icon(path: ReactNode) {
  return function Icon({ className }: IconProps) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className ?? "size-5"}
      >
        {path}
      </svg>
    );
  };
}

export const IconDashboard = icon(
  <>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </>,
);
export const IconBag = icon(
  <>
    <path d="M6 7h12l1 13H5z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </>,
);
export const IconBox = icon(
  <>
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="m3 8 9 5 9-5M12 13v8" />
  </>,
);
export const IconUsers = icon(
  <>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
  </>,
);
export const IconPrinter = icon(
  <>
    <path d="M6 9V3h12v6" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M6 14h12v7H6z" />
  </>,
);
export const IconWallet = icon(
  <>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
  </>,
);
export const IconCalculator = icon(
  <>
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h8" />
  </>,
);
export const IconUndo = icon(
  <>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </>,
);
export const IconMoney = icon(
  <>
    <path d="M12 2v20" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </>,
);
export const IconBell = icon(
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
);
export const IconArrow = icon(<path d="M7 17 17 7M8 7h9v9" />);
export const IconPlus = icon(<path d="M12 5v14M5 12h14" />);
export const IconUpload = icon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <path d="m17 8-5-5-5 5M12 3v12" />
  </>,
);
export const IconStore = icon(
  <>
    <path d="M3 9 4.5 4h15L21 9" />
    <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" />
    <path d="M5 13v8h14v-8" />
  </>,
);
export const IconLogout = icon(
  <>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </>,
);
