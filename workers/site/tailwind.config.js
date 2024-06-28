/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui'
export default {
  content: [
    './src/**/*.html',
    './src/**/*.tsx',
    './src/**/*.js',
    'node_modules/daisyui/dist/**/*.js',
    'node_modules/react-daisyui/dist/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
}
