/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E2C97E',
          dark: '#A07830',
        },
        bg: {
          DEFAULT: '#020204',
          card: 'rgba(255,255,255,0.03)',
          hover: 'rgba(255,255,255,0.06)',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E2C97E 50%, #A07830 100%)',
      },
    },
  },
  plugins: [],
}
