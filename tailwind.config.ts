import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./tools/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        line: "var(--line)",
        foreground: "var(--text)",
        muted: "var(--muted)",
        secondary: "var(--text-secondary)",
        accent: "var(--accent)",
        "accent-ink": "var(--accent-ink)",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      textColor: {
        foreground: "var(--text)",
      },
      borderColor: {
        line: "var(--line)",
      },
      backgroundColor: {
        canvas: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
      },
      ringColor: {
        accent: "var(--accent)",
      },
      ringOffsetColor: {
        canvas: "var(--bg)",
      },
    },
  },
  plugins: [],
};

export default config;
