import theme from "./app/theme"

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  corePlugins: {
    fontSize: false,
  },
  theme: {
    ...theme,
  },
  plugins: [
    require("tailwindcss-fluid-type"),
    require("@headlessui/tailwindcss"),
  ],
}
