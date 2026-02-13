/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orange: {
          50: '#FFF4E6',
          100: '#FFE8CC',
          200: '#FFD199',
          300: '#FFBA66',
          400: '#FFA333',
          500: '#F57C00',
          600: '#E67100',
          700: '#C85E00',
          800: '#A04B00',
          900: '#783800',
        },
      },
    },
  },
  plugins: [],
};
