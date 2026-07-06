/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        surface: '#121B2E',
        paper: '#F7F8FB',
        signal: {
          DEFAULT: '#5B5BF6',
          light: '#8B8BFA',
          dark: '#4040D0',
        },
        pulse: {
          DEFAULT: '#2DD4BF',
          light: '#5EEAD4',
          dark: '#0F9C8C',
        },
        ember: {
          DEFAULT: '#FB923C',
          light: '#FDBA74',
        },
        slate: {
          ink: '#1E293B',
          soft: '#64748B',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        lifted: '0 8px 24px -4px rgb(15 23 42 / 0.12)',
        glow: '0 0 0 1px rgb(91 91 246 / 0.15), 0 8px 24px -8px rgb(91 91 246 / 0.35)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        'float-slower': 'floatSlow 9s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(45, 212, 191, 0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(45, 212, 191, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(45, 212, 191, 0)' },
        },
      },
    },
  },
  plugins: [],
};
