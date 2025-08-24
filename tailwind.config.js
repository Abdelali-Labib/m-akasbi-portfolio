/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
    },
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    fontFamily: {
      primary: "var(--font-PTserif)",
    },
    extend: {
      colors: {
        primary: "#1c1c22",
        light: "white",
        accent: {
          DEFAULT: "#FF9932",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
