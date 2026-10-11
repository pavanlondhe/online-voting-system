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
        gov: {
          navy: {
            DEFAULT: '#0a2540',
            50: '#f0f6ff',
            100: '#e0edff',
            200: '#b9dbfe',
            700: '#1a365d',
            800: '#0f294a',
            900: '#0a1d33',
            950: '#061221',
          },
          saffron: {
            DEFAULT: '#ea580c',
            50: '#fff7ed',
            100: '#ffedd5',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
          green: {
            DEFAULT: '#16a34a',
            50: '#f0fdf4',
            100: '#dcfce7',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
          },
          gold: '#c59b27',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
