"use client";

interface AspectRatioConnectorProps {
  connected: boolean;
  onToggle: () => void;
  lockedLabel: string;
  unlockedLabel: string;
}

function ConnectorGraphic({ connected, vertical }: { connected: boolean; vertical: boolean }) {
  const stroke = connected ? "var(--cat-image)" : "var(--line)";
  const plugX = connected ? 30 : 22;

  return (
    <svg
      viewBox="0 0 64 32"
      width={64}
      height={32}
      aria-hidden="true"
      className={vertical ? "rotate-90" : undefined}
    >
      <line
        x1="4"
        y1="16"
        x2="14"
        y2="16"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray={connected ? undefined : "3 3"}
        strokeLinecap="round"
      />
      <rect
        x={plugX}
        y="11"
        width="10"
        height="10"
        rx="2"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <line x1={plugX + 2} y1="14" x2={plugX + 2} y2="18" stroke={stroke} strokeWidth="1.5" />
      <line x1={plugX + 5} y1="14" x2={plugX + 5} y2="18" stroke={stroke} strokeWidth="1.5" />
      <line x1={plugX + 8} y1="14" x2={plugX + 8} y2="18" stroke={stroke} strokeWidth="1.5" />
      <rect
        x="38"
        y="10"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
      />
      <rect x="40" y="14" width="8" height="4" rx="1" fill={connected ? "var(--cat-image)" : "none"} />
      <line
        x1="50"
        y1="16"
        x2="60"
        y2="16"
        stroke={stroke}
        strokeWidth="2"
        strokeDasharray={connected ? undefined : "3 3"}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function AspectRatioConnector({
  connected,
  onToggle,
  lockedLabel,
  unlockedLabel,
}: AspectRatioConnectorProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={connected}
      aria-label={connected ? lockedLabel : unlockedLabel}
      title={connected ? lockedLabel : unlockedLabel}
      className="group flex shrink-0 items-center justify-center rounded-md border border-transparent p-1 transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 motion-reduce:transition-none dark:hover:bg-gray-800"
    >
      <span className="hidden sm:block motion-reduce:transition-none transition-transform duration-200 group-active:scale-95">
        <ConnectorGraphic connected={connected} vertical={false} />
      </span>
      <span className="sm:hidden motion-reduce:transition-none transition-transform duration-200 group-active:scale-95">
        <ConnectorGraphic connected={connected} vertical={true} />
      </span>
    </button>
  );
}
