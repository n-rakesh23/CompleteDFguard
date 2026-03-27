/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace']
      },
      colors: {
        brand: {
          cyan:   '#22d3ee',
          violet: '#a855f7',
          pink:   '#ec4899',
          indigo: '#6366f1'
        },
        surface: {
          base:    '#050814',
          raised:  '#0a0f1e',
          overlay: '#0f1629'
        }
      },
      backgroundImage: {
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
        'cyber-gradient':    'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 60%, #d946ef 100%)',
        'subtle-gradient':   'linear-gradient(135deg, rgba(34,211,238,0.08) 0%, rgba(168,85,247,0.08) 100%)',
      },
      boxShadow: {
        'glow-cyan':   '0 0 24px rgba(34,211,238,0.2)',
        'glow-violet': '0 0 24px rgba(168,85,247,0.2)',
        'glow-pink':   '0 0 24px rgba(236,72,153,0.2)',
        'card':        '0 4px 40px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-up':     'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':     'fadeIn 0.6s ease forwards',
        'scan':        'scan-move 3s linear infinite',
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulse-glow 3s ease-in-out infinite',
        'shimmer':     'shimmer 4s linear infinite',
      }
    }
  },
  plugins: []
};
