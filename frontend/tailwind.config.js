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
        // Banking/Lending + blue-night UI
        'banking-navy': '#0f172a',
        'banking-slate': '#334155',
        'banking-teal': '#38bdf8',
        'banking-blue': '#2563eb',
        'banking-ink': '#020617',
        'banking-red': '#ef4444',
        'banking-amber': '#f59e0b',
        'banking-green': '#10b981',
        'banking-light': '#f8fafc',
        'banking-border': '#e2e8f0',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'banking': '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        'banking-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
