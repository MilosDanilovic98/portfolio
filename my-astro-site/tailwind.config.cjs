/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
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
