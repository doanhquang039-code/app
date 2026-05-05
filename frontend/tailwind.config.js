/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        info: {
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
        },
      },
      backgroundImage: {
        'gradient-primary':  'linear-gradient(135deg, #6366f1, #8b5cf6)',
        'gradient-success':  'linear-gradient(135deg, #10b981, #06b6d4)',
        'gradient-danger':   'linear-gradient(135deg, #f43f5e, #fb7185)',
        'gradient-warning':  'linear-gradient(135deg, #f59e0b, #fbbf24)',
        'gradient-card':     'linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.10)',
      },
      keyframes: {
        fadeInUp: {
          '0%'  : { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          '0%'  : { opacity: '0', transform: 'scale(0.9) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(99,102,241,0.3)' },
          '50%':       { boxShadow: '0 0 35px rgba(99,102,241,0.6)' },
        },
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.4s ease both',
        'modal-in':    'modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'pulse-glow':  'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
