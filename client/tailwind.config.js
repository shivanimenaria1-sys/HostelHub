/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          550: '#4f73ff',
          500: '#3b5cff',
          600: '#283cff',
          700: '#1b25e6',
          800: '#161cb8',
          900: '#171c91',
        }
      }
    },
  },
  plugins: [],
}
