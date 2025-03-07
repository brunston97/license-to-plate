import { nextui } from '@nextui-org/react'
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export const content = [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
]
export const theme = {
  extend: {
    colors: {
      'bg-primary-1': '#ac9add',
      'bg-primary-2': '#9aa9dd'
    },
    fontFamily: {
      barlow: ['Barlow', 'sans-serif']
    }
  }
}
export const darkMode = 'class'
export const plugins = [nextui(), daisyui]
