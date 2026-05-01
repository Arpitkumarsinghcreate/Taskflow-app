/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#1D9E75',
          'green-dark': '#17875f',
        },
        dark: {
          bg: '#0a0a0a',
          surface: '#0f0f0f',
          card: '#111111',
          border: '#1e1e1e',
          'border-hover': '#2e2e2e',
        },
        content: {
          primary: '#f0f0f0',
          secondary: '#888888',
          muted: '#444444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
