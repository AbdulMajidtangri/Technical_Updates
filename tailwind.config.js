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
        brand: {
          50: "#f5f0ff",
          100: "#ebe2ff",
          200: "#d4c4ff",
          300: "#b59bff",
          400: "#9368f5",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
          800: "#4c1d95",
          900: "#3b1578",
          950: "#240e4a",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 hsl(260 20% 10% / 0.06), 0 1px 2px -1px hsl(260 20% 10% / 0.06)",
        elevated: "0 4px 6px -1px hsl(260 20% 10% / 0.08), 0 2px 4px -2px hsl(260 20% 10% / 0.06)",
      },
    },
  },
  plugins: [],
};
