import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F5F1E6',
        'paper-dark': '#E8E0D0',
        'paper-edge': '#D4C8B0',
        ink: '#2C2416',
        'ink-light': '#4A3F2F',
        'ink-faded': '#6B5D4D',
        accent: '#8B0000',
        'accent-light': '#A52A2A',
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['EB Garamond', 'serif'],
        mono: ['Special Elite', 'monospace'],
      },
      backgroundImage: {
        'paper-texture': "url('/noise.png')",
      },
    },
  },
  plugins: [],
}
export default config
