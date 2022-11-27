/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
		colors: {
			transparent: 'transparent',
			current: 'currentColor',
			'white': 'var(--lowContrastText)',
			'purple': 'var(--mainBackground)',
			'midnight': '#121063',
			'bla': 'var(--testNameBackground)',
			'tahiti': '#3ab7bf',
			'silver': '#ecebff',
			'bubble-gum': '#ff77e9',
			'bermuda': '#78dcca',
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
