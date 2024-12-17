/** @type {import('tailwindcss').Config} */
import nextui from '@nextui-org/react';

export default {
  content: ['./src/**/*.{mjs,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [
    nextui()
  ]
}
