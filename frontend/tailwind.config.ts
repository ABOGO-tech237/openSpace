import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080A0F',
        surface: '#0E1118',
        'surface-2': '#121826',
        border: '#1F2937',
        text: '#F3F4F6',
        'text-secondary': '#9CA3AF',
        'text-muted': '#6B7280',
        muted: '#8B95A8',
        dim: '#2A3347',
        red: '#E8190A',
        'red-l': '#FF3D2E',
        primary: '#E8190A',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        sora: ['var(--font-plus-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        dm: ['var(--font-plus-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'pulse-dot': 'pulseDot 2s infinite',
        glow: 'glowBreath 3.5s ease infinite',
        grad: 'gradShift 5s ease infinite',
        float: 'orbFloat 8s ease-in-out infinite',
        blink: 'cursorBlink 1s step-end infinite',
      },
      keyframes: {
        pulseDot: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(232,25,10,0.6)' },
          '70%': { boxShadow: '0 0 0 10px rgba(232,25,10,0)' },
        },
        glowBreath: {
          '0%,100%': { opacity: '0.25' },
          '50%':     { opacity: '0.55' },
        },
        gradShift: {
          '0%,100%': { backgroundPosition: '0% 50%' },
          '50%':     { backgroundPosition: '100% 50%' },
        },
        orbFloat: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-30px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,20px) scale(0.97)' },
        },
        cursorBlink: {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
export default config
