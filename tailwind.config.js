/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'PingFang SC', 'Microsoft YaHei', 'sans-serif']
      },
      colors: {
        difficulty: {
          1: '#10b981',  // green
          2: '#3b82f6',  // blue
          3: '#f59e0b',  // amber
          4: '#ef4444',  // red
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}
