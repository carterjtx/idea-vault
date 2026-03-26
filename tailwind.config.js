/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#0A0E1A',
          card: '#131829',
          cardHover: '#1A2035',
          border: '#1E2642',
          gold: '#D4A843',
          goldLight: '#E8C875',
          goldDim: '#8B7332',
          amber: '#F0A830',
          text: '#E8E8EC',
          textDim: '#8A8FA8',
          textMuted: '#5A5F78',
          navy: '#0D1225',
          navyLight: '#162040',
          accent: '#3B82F6',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
        },
      },
      fontFamily: {
        heading: ['SpaceMono'],
        body: ['SpaceMono'],
      },
    },
  },
  plugins: [],
};
