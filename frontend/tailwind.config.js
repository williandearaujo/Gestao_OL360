const OL_LIGHT = {
  primary: '#821314',
  light: '#c9252c',
  hover: '#6d0f10',
  hoverText: '#4C1D1D',
  bg: '#fef2f2',          // fundo geral claro da página
  cardBg: '#fbfafb',      // fundo cinza claro para cards (destaque sutil)
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
  bg: '#1f1f1f',          // fundo geral escuro da página
  cardBg: 'rgb(44 44 44 / <alpha-value>)', // fundo escuro para cards
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
        ol: {
          primary: OL_LIGHT.primary,
          light: OL_LIGHT.light,
          hover: OL_LIGHT.hover,
          hoverText: OL_LIGHT.hoverText,
          bg: OL_LIGHT.bg,
          cardBg: OL_LIGHT.cardBg,
          border: OL_LIGHT.border,
          text: OL_LIGHT.text,
          black: OL_LIGHT.black,
          white: OL_LIGHT.white,
          grayLight: OL_LIGHT.grayLight,
          grayMedium: OL_LIGHT.grayMedium,
          success: OL_LIGHT.success,
          warning: OL_LIGHT.warning,
          error: OL_LIGHT.error,
          info: OL_LIGHT.info,
        },
        darkOl: {
          primary: OL_DARK.primary,
          light: OL_DARK.light,
          hover: OL_DARK.hover,
          hoverText: OL_DARK.hoverText,
          bg: OL_DARK.bg,
          cardBg: OL_DARK.cardBg,
          border: OL_DARK.border,
          text: OL_DARK.text,
          black: OL_DARK.black,
          white: OL_DARK.white,
          grayLight: OL_DARK.grayLight,
          grayMedium: OL_DARK.grayMedium,
          success: OL_DARK.success,
          warning: OL_DARK.warning,
          error: OL_DARK.error,
          info: OL_DARK.info,
        },
      },
    },
  },
  plugins: [],
}
