/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ["primary"]: "rgb(96 165 250)", //blue-400
        ["primary-alt"]: "rgb(59 130 246)", //blue-500
        ["primary-dimmed"]: "rgb(224 242 254)", //sky-100
        ["primary-dimmed-alt"]: "rgb(191 219 254)", //blue-200
      },
    },
  },
  plugins: [],
};
