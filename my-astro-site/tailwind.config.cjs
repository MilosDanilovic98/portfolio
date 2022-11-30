/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      dropShadow: {
        '3xl': '5px 5px 5px 5px rgba(220, 224, 223, 1)',
      },
      fontFamily: {
        'MyFont': ['MyFont', 'serif']
        
      },
      colors: {
        appBackground: "var(--appBackground)",
        subtleBackground: "var(--subtleBackground)",
        componentBackground: "var(--componentBackground)",
        componentBackgroundHover: "var(--componentBackgroundHover)",
        componentBackgroundSelected: "var(--componentBackgroundSelected)",
        subtleBorder: "var(--subtleBorder)",
        focusBorder: "var(--focusBorder)",
        hoverBorder: "var(--hoverBorder)",
        solidBackground: "var(--solidBackground)",
        solidBackgroundHover: "var(--solidBackgroundHover)",
        lowContrastText: "var(--lowContrastText)",
        highContrastText: "var(--highContrastText)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        dark: "var(--dark)",
        orange: "var(--orange)",
        white: "var(--white)",
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: [],
    base: true,
    utils: true,
  },
};
