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
        background: '#0d1117',
        surface: {
          DEFAULT: '#161b22',
          card: '#1b2028',
          hover: '#21262d',
          active: '#282e36',
          border: '#30363d',
          muted: '#21262d'
        },
        brand: {
          50: '#ebf5ff',
          100: '#e1effe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        status: {
          todo: '#64748b',
          inprogress: '#0284c7',
          inreview: '#d97706',
          done: '#16a34a',
          blocked: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
