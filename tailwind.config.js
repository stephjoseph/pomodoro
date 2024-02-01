/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        salmon: '#F87070',
        turquoise: '#70F3F8',
        lavender: '#D881F8',
        'light-grey': '#D7E0FF',
        'midnight-blue': '#1E213F',
        white: '#FFFFFF',
        'pale-grey': '#EFF1FA',
        'midnight-navy': '#161932',
      },

      fontFamily: {
        sans: ['"Kumbh Sans"', ...defaultTheme.fontFamily.sans],
        serif: ['"Roboto Slab"', ...defaultTheme.fontFamily.serif],
        mono: ['"Space Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
