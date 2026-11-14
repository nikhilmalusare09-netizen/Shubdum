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
          darkred: '#831843', // deep red/maroon
          red: '#dc2626',
          crimson: '#991b1b',
          orange: '#ea580c',
          amber: '#f59e0b',
          cream: '#fffbeb',
          dark: '#1c1917',
          surface: '#292524'
        },
        veg: '#16a34a',
        nonveg: '#dc2626'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

