/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8ee',
          100: '#fbf0d5',
          200: '#f5dfaa',
          300: '#eec774',
          400: '#e7ac44',
          500: '#d98a27', // signature gold/amber
          600: '#c5711e',
          700: '#a3541b',
          800: '#83411c',
          900: '#6c351b',
          950: '#3e1a0c',
        },
        dark: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#373737',
          900: '#1e1e1e', // deep charcoal
          950: '#0f0f0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(217, 138, 39, 0.25)',
      }
    },
  },
  plugins: [],
}
