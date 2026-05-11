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
          50: '#FFFBF7',
          100: '#FAF7F0',
          200: '#F5F0E6',
          300: '#EDE5D9',
        },
        ink: {
          50: '#3D2B1F',
          100: '#2A1D14',
          200: '#1A1208',
          300: '#0D0906',
        },
        saffron: {
          50: '#FEF0C3',
          100: '#FDE38A',
          200: '#F9C846',
          300: '#D4851A',
          400: '#B86A14',
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