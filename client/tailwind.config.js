/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        secondary: '#22c55e',
        danger: '#ef4444',
      }
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
