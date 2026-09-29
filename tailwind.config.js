/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#FAF8F5',
          100: '#F5F1E9',
          200: '#EBE5D9',
          300: '#DDD4C3',
          400: '#C7B9A3',
          500: '#A8977E',
          600: '#877660',
          700: '#685948',
          800: '#4C4033',
          900: '#322A22',
        },
        bronze: {
          50: '#FAF4EF',
          100: '#F3E5DC',
          200: '#E7C8B6',
          300: '#D9A98C',
          400: '#C88863',
          500: '#B66E43',
          600: '#9C5832',
          700: '#7C4325',
          800: '#5F331D',
          900: '#442515',
        },
        slate: {
          850: '#161E28',
          950: '#0C1117',
        }
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(28, 25, 23, 0.06), 0 2px 6px -1px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 10px 30px -4px rgba(28, 25, 23, 0.1), 0 4px 10px -2px rgba(28, 25, 23, 0.05)',
        'drawer': '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'breathe-in': 'breatheIn 4s ease-in-out forwards',
        'breathe-out': 'breatheOut 8s ease-in-out forwards',
        'pulse-subtle': 'pulseSubtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.4)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.6' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      }
    },
  },
  plugins: [],
}
