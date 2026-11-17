const { colors } = require('./src/constants/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: { extend: { colors, borderRadius: { card: '28px' } } },
  plugins: [],
};
