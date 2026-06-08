/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6dfff',
          300: '#b3c3ff',
          400: '#859dff',
          500: '#536dfe', // Indigo-blue premium accent
          600: '#3d4ff7',
          700: '#313ee0',
          800: '#2832b8',
          900: '#252e93',
          950: '#151957',
        },
        darkBg: '#090a0f', // Sleek background color
        darkCard: '#11131c', // Card container color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Inter', 'monospace'],
        serif: ['Inter', 'serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
