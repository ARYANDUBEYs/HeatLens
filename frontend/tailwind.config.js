/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#060a14',
          900: '#0a0f1d',
          850: '#0e1629',
          800: '#111827',
          700: '#1f2937'
        },
        satellite: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#ef4444',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'radar-sweep': 'radarSweep 6s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-cyan': 'glowCyan 2.5s ease-in-out infinite',
      },
      keyframes: {
        radarSweep: {
          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
        },
        glowCyan: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.7)' }
        }
      }
    },
  },
  plugins: [],
}
