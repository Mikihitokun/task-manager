/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx.tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        card: '#1C1C1C',
        border: '#2A2A2A',
        accent: '#4ADE80,
        'accent-dim': '#166534',
        deadline: '#F87171',
        someday: '#60A5FA',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
