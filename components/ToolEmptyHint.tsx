"use client";

interface ToolEmptyHintProps {
  message: string;
  show?: boolean;
}

export default function ToolEmptyHint({ message, show = true }: ToolEmptyHintProps) {
  if (!show) return null;

  return (
    <p className="rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted">
      {message}
    </p>
  );
}
