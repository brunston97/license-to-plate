const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
      content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary-1': '#9aa9dd',
        'bg-primary-2': '#ac9add'
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
