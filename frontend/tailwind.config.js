const OL_LIGHT = {
  primary: '#821314',
  light: '#c9252c',
  hover: '#6d0f10',
  hoverText: '#4C1D1D',
  bg: '#fef2f2',
  cardBg: '#fbfafb',
  border: '#c9252c',
  text: '#821314',

  black: '#000000',
  white: 'rgb(255 255 255 / <alpha-value>)',
  grayLight: '#fcfcfc',
  grayMedium: 'rgb(95 95 95 / <alpha-value>)',

  success: '#3b82f6',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
}

const OL_DARK = {
  primary: '#ef4444',
  light: '#f87171',
  hover: 'rgba(185, 28, 28, 0.9)',
  hoverText: '#ffffff',
  bg: '#1f1f1f',
  cardBg: 'rgb(44 44 44 / <alpha-value>)',
  border: '#f87171',
  text: '#f87171',

  black: '#ffffff',
  white: 'rgb(255 255 255 / <alpha-value>)',
  grayLight: 'rgb(44 44 44 / <alpha-value>)',
  grayMedium: 'rgb(95 95 95 / <alpha-value>)',

  success: '#3b82f6',
  warning: '#fbbf24',
  error: '#ef4444',
  info: '#60a5fa',
}

module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ol: { ...OL_LIGHT },
        darkOl: { ...OL_DARK },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
