/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%": { transform: "rotate(translateY(0px))" },
          "50%": { transform: "rotate(translateY(-20px))" },
          "100%": { transform: "rotate(translateY(0px))" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      dropShadow: {
        "3xl": "4px 4px 0px var(--dark)",
        "1xl": "0px 0px 0px var(--dark)",
      },
      fontFamily: {
        mainFont: ["mainFont", "serif"],
        lightFont: ["lightFont", "serif"],
        italicFont: ["italicFont", "serif"],
        robotoCondensed: ["robotoCondensed", "serif"],
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
        projectCardBg: "var(--projectCardBg)",
        drawerBackground: "var(--drawerBackground)",
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
