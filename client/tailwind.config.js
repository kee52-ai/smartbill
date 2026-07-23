/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7f7',
          100: '#e8ecec',
          200: '#c9d2d1',
          300: '#a2b0af',
          400: '#748584',
          500: '#566a69',
          600: '#425453',
          700: '#374544',
          800: '#2b3736',
          900: '#1c2524',
          950: '#101615',
        },
        teal: {
          50: '#eef7f5',
          100: '#d6ece6',
          200: '#aed9cd',
          300: '#7cbfae',
          400: '#4c9e8a',
          500: '#2f8170',
          600: '#22685a',
          700: '#1c534a',
          800: '#18423b',
          900: '#153732',
          950: '#0a201c',
        },
        coral: {
          50: '#fef4ef',
          100: '#fde5d8',
          200: '#fbc7ab',
          300: '#f8a171',
          400: '#f3763c',
          500: '#e8562a',
          600: '#d13e1f',
          700: '#ad2f1c',
          800: '#89281c',
          900: '#70241b',
        },
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(16, 22, 21, 0.06), 0 1px 2px rgba(16, 22, 21, 0.04)',
        lift: '0 12px 24px rgba(16, 22, 21, 0.10), 0 2px 6px rgba(16, 22, 21, 0.06)',
      },
      borderRadius: {
        '2.5xl': '1.375rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        sweep: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        countUp: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s infinite linear',
        sweep: 'sweep 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
