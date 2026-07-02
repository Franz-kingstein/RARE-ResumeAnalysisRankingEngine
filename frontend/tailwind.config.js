/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        // Middle palette — primary corporate brand tones
        ink: "#1D1A39", // borrowed from left palette for deepest text/nav
        violet: {
          DEFAULT: "#532057",
          50: "#F6EFF6",
          100: "#EBD9EC",
          400: "#8A4A8E",
          500: "#532057",
          600: "#3F1943",
          700: "#2C122F",
        },
        orchid: {
          DEFAULT: "#9B4C7D",
          400: "#B06C97",
          500: "#9B4C7D",
          600: "#7C3C64",
        },
        rose: {
          DEFAULT: "#C26A9A",
          300: "#D998B8",
          400: "#C26A9A",
          500: "#AE445A", // left palette — muted crimson, used for "at risk" states
        },
        peach: {
          DEFAULT: "#EAD2C7",
          300: "#F3E3DB",
          400: "#EAD2C7",
          500: "#F39F5A", // left palette — warm peach accent
        },
        cream: {
          DEFAULT: "#EFECE9",
          50: "#FAF9F7",
          100: "#EFECE9",
        },
        plum: "#451952",
        magenta: "#662549",
      },
      boxShadow: {
        panel: "0 1px 2px rgba(29, 26, 57, 0.04), 0 8px 24px -8px rgba(83, 32, 87, 0.12)",
        pop: "0 12px 32px -12px rgba(83, 32, 87, 0.35)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #1D1A39 0%, #532057 28%, #9B4C7D 55%, #C26A9A 75%, #F39F5A 100%)",
        "brand-gradient-soft": "linear-gradient(135deg, #532057 0%, #9B4C7D 45%, #C26A9A 75%, #EAD2C7 100%)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
