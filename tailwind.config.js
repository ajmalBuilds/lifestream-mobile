/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          red: '#DC2626',
          darkRed: '#991B1B',
        },
        secondary: {
          blue: '#1E40AF',
          green: '#059669',
          orange: '#EA580C',
        },
        neutral: {
          gray: '#6B7280',
          lightGray: '#F3F4F6',
          white: '#FFFFFF',
          black: '#1F2937',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
      },
    },
  },
  plugins: [],
}