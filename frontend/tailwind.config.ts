import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc7fb',
          400: '#38a8f7',
          500: '#0e8ce9',
          600: '#026ec7',
          700: '#0358a1',
          800: '#074a85',
          900: '#0c3f6e',
          950: '#072748',
        },
        navy: {
          800: '#0f172a',
          900: '#0a192f',
          950: '#030d1a',
        },
        accent: {
          DEFAULT: '#1D68F2', // Royal Blue matching reference
          hover: '#1557D0',
          light: '#EBF2FE',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1D68F2',
          700: '#1557D0',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        darkNavy: {
          DEFAULT: '#0B1B3D',
          dark: '#071228',
          light: '#132857',
        },
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        jakarta: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
