/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f9',
          100: '#dce5f2',
          200: '#bfd0e8',
          300: '#93b0da',
          400: '#6089c7',
          500: '#3c68b3',
          600: '#2b5097',
          700: '#1e3c78',
          800: '#142a57',
          900: '#0c1c3d',
          950: '#071126',
        },
        turquoise: {
          50: '#effcfc',
          100: '#d7f7f8',
          200: '#b4eef0',
          300: '#80dfe5',
          400: '#45c8d2',
          500: '#24acb8',
          600: '#1f8a9a',
          700: '#1f6f7d',
          800: '#215b67',
          900: '#204c57',
          950: '#10313a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
