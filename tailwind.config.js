/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060f1e',
          900: '#0a1628',
          800: '#0d1f3c',
          700: '#112a50',
          600: '#163565',
        },
        ocean: {
          700: '#1a3a6b',
          600: '#1d55a8',
          500: '#1d6fd8',
          400: '#3b82f6',
          300: '#60a5fa',
          200: '#93c5fd',
          100: '#dbeafe',
          50:  '#eff6ff',
        },
        electric: {
          500: '#0ea5e9',
          400: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.07)',
        'glow-blue': '0 0 20px rgba(29,111,216,0.25)',
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(180deg, #060f1e 0%, #0a1628 40%, #0d1f3c 100%)',
        'header-gradient': 'linear-gradient(135deg, #0a1628 0%, #112a50 50%, #1a3a6b 100%)',
        'blue-gradient': 'linear-gradient(135deg, #1d55a8 0%, #1d6fd8 100%)',
        'accent-gradient': 'linear-gradient(135deg, #1d6fd8 0%, #0ea5e9 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'spin-once': 'spin 0.6s ease-in-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
