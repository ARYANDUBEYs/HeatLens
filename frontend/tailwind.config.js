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
          50: '#eff6ff',
          500: '#0078d4', // Microsoft Azure Blue
          600: '#106ebe',
          700: '#005a9e',
          900: '#002050',
        },
        heat: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#ef4444',
          extreme: '#991b1b'
        }
      }
    },
  },
  plugins: [],
}
