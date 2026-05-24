import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        cream: {
          50: 'rgb(var(--cream-50) / <alpha-value>)',
          100: 'rgb(var(--cream-100) / <alpha-value>)',
          200: 'rgb(var(--cream-200) / <alpha-value>)',
          300: 'rgb(var(--cream-300) / <alpha-value>)',
        },
        ink: {
          50: 'rgb(var(--ink-50) / <alpha-value>)',
          100: 'rgb(var(--ink-100) / <alpha-value>)',
          200: 'rgb(var(--ink-200) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
        },
        saffron: {
          50: 'rgb(var(--saffron-50) / <alpha-value>)',
          100: 'rgb(var(--saffron-100) / <alpha-value>)',
          200: 'rgb(var(--saffron-200) / <alpha-value>)',
          300: 'rgb(var(--saffron-300) / <alpha-value>)',
          400: 'rgb(var(--saffron-400) / <alpha-value>)',
          600: 'rgb(var(--saffron-600) / <alpha-value>)',
        },
      },
      fontFamily: {
        bengali: ['var(--font-noto-serif-bengali)', 'serif'],
        display: ['var(--font-playfair-display)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'bengali-fluid': ['clamp(1rem, 2.5vw, 1.25rem)', '1.8'],
        'display-fluid': ['clamp(1.5rem, 4vw, 3rem)', '1.2'],
      },
      lineHeight: {
        relaxed: '1.8',
      },
      backgroundImage: {
        'paper-texture': 'url("/paper-texture.svg")',
      },
    },
  },
  plugins: [],
};

export default config;