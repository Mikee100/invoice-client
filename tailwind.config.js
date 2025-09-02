// Tailwind config with safe color palette for html2canvas/jsPDF compatibility
const legacyColors = require('@tailwindcss/legacy-colors');

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    colors: legacyColors,
    extend: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e42',
        info: '#0ea5e9',
      },
    },
  },
  plugins: [],
};
