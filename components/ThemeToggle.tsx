"use client";

import { useEffect, useState, type MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { toggleThemeWithTransition } from "@/lib/theme-transition";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  const handleToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (!mounted) return;
    toggleThemeWithTransition(
      setTheme,
      isDark ? "light" : "dark",
      event.clientX,
      event.clientY
    );
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label={
        mounted
          ? isDark
            ? t.header.switchToLightMode
            : t.header.switchToDarkMode
          : t.header.toggleTheme
      }
    >
      {mounted ? (
        isDark ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )
      ) : (
        <Sun className="h-4 w-4 opacity-0" aria-hidden="true" />
      )}
    </button>
  );
}
