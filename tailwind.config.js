/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          secondary: "hsl(var(--accent-secondary))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 hsl(260 20% 10% / 0.05), 0 8px 20px -6px hsl(265 60% 40% / 0.08)",
        elevated: "0 8px 30px -6px hsl(265 60% 40% / 0.15), 0 4px 12px -4px hsl(260 20% 10% / 0.08)",
        glow: "0 0 40px -8px hsl(var(--glow) / 0.45)",
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
