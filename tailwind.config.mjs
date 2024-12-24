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
        'bg-primary-1': '#ac9add',
        'bg-primary-2': '#9aa9dd'
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
