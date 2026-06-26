"use client";

interface ToolEmptyHintProps {
  message: string;
  show?: boolean;
}

export default function ToolEmptyHint({ message, show = true }: ToolEmptyHintProps) {
  if (!show) return null;

  return (
    <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/40 dark:text-gray-400">
      {message}
    </p>
  );
}
