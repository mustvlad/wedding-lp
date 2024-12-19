/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Blackriver', 'sans-serif'],
        'body': ['Playfair Display', 'serif']
      }
    },
  },
  plugins: [],
}

