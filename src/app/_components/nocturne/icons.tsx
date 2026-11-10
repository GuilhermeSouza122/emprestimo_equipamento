export type IconName =
  | "package" | "squares-four" | "hand-arrow-down" | "list-checks" | "plus-square"
  | "laptop" | "monitor" | "video-camera" | "usb" | "projector-screen"
  | "magnifying-glass" | "funnel" | "info" | "caret-right" | "caret-down"
  | "arrow-right" | "plus" | "bell" | "eye" | "eye-off" | "envelope" | "lock"
  | "warning" | "wrench" | "check" | "arrow-up-right";

const shapes: Record<IconName, React.ReactNode> = {
  package: <path d="M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8" />,
  "squares-four": <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />,
  "hand-arrow-down": <path d="M12 3v8m0 0-3-3m3 3 3-3M4 15h4l2 2h4a2 2 0 0 0 0-4h-3M8 15v5h8l4-4" />,
  "list-checks": <path d="m3.5 6.5 1.5 1.5 2.5-3M3.5 13.5 5 15l2.5-3M11 7h10M11 14h10M3.5 20h4M11 20h10" />,
  "plus-square": <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M12 8v8M8 12h8" /></>,
  laptop: <><rect x="5" y="5" width="14" height="10" rx="1.5" /><path d="M2 19h20" /></>,
  monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>,
  "video-camera": <><rect x="3" y="6" width="12" height="12" rx="2" /><path d="m15 10 6-3v10l-6-3" /></>,
  usb: <><path d="M12 3v14M12 12 7 9V7M12 9l5-2" /><circle cx="12" cy="19" r="2" /><circle cx="17" cy="6" r="1.5" /><rect x="6" y="5" width="2" height="2" /></>,
  "projector-screen": <path d="M3 4h18M5 4v10h14V4M12 14v5M9 21l3-2 3 2" />,
  "magnifying-glass": <><circle cx="11" cy="11" r="6" /><path d="m20 20-4-4" /></>,
  funnel: <path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  "caret-right": <path d="m9 6 6 6-6 6" />,
  "caret-down": <path d="m6 9 6 6 6-6" />,
  "arrow-right": <path d="M5 12h14m-6-6 6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  bell: <path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4l2-2ZM10 21h4" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
  "eye-off": <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /><path d="m3 3 18 18" /></>,
  envelope: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  warning: <><path d="m10.3 4-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4m0 4h.01" /></>,
  wrench: <path d="M14.5 6.5 17 9l4-4a6 6 0 0 1-7.8 7.8l-7.7 7.7a2.1 2.1 0 0 1-3-3l7.7-7.7A6 6 0 0 1 18 2l-3.5 4.5Z" />,
  check: <path d="m5 12 5 5 9-10" />,
  "arrow-up-right": <path d="M7 17 17 7M8 7h9v9" />,
};

export function Icon({
  name,
  size = 16,
  filled = false,
}: {
  name: IconName;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      fillOpacity={filled ? 0.22 : undefined}
      stroke="currentColor"
      strokeWidth={filled ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="nocturne-icon"
    >
      {shapes[name]}
    </svg>
  );
}
