import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#2A4A1F',
          gold: '#C9A227',
          pink: '#E8426A',
          surface: '#1E3A16',
          cream: '#FFFBF2',
        },
        event: {
          deadline: '#DC2626',
          prep: '#9333EA',
          delivery: '#2563EB',
          unavailable: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
