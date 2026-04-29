/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // font-display → Playfair Display (headings)
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        // font-sans → DM Sans (body/UI) — overrides Tailwind default
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        // font-mono → JetBrains Mono
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        gold: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // charcoal — used throughout all UI components
        charcoal: {
          50:  '#f8f8f8',
          100: '#efefef',
          200: '#dcdcdc',
          300: '#bdbdbd',
          400: '#989898',
          500: '#7c7c7c',
          600: '#656565',
          700: '#525252',
          800: '#464646',
          900: '#3d3d3d',
          950: '#1a1a1a',
        },
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'slide-in':  'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'luxury': '0 4px 40px rgba(0,0,0,0.12)',
        'card':   '0 2px 20px rgba(0,0,0,0.08)',
        'gold':   '0 4px 20px rgba(245,158,11,0.3)',
      },
    },
  },
  plugins: [],
}
