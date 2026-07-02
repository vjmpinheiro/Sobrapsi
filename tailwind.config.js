/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        site: "80rem", // 1280px — container do site
      },
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        muted: {
          DEFAULT: "#a1a1aa",
          foreground: "#71717a",
        },
        card: {
          DEFAULT: "#18181b",
          foreground: "#ffffff",
        },
        border: "#27272a",
        primary: {
          DEFAULT: "#8a5cf5",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#27272a",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#6d3fd4",
          foreground: "#ffffff",
        },
        destructive: "#ef4444",
        ring: "#8a5cf5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
