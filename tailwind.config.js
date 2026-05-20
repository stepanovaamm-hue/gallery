/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Segoe UI', 'Arial', 'sans-serif'],
      },
      colors: {
        ink: '#070914',
        aurora: '#6ee7f9',
        mint: '#8fffcb',
        sun: '#ffd166',
        coral: '#ff7a8a',
        violet: '#a78bfa',
      },
      boxShadow: {
        glow: '0 0 32px rgba(110, 231, 249, 0.25)',
        warm: '0 18px 60px rgba(255, 122, 138, 0.16)',
      },
      backgroundImage: {
        'future-grid':
          'linear-gradient(rgba(110,231,249,.13) 1px, transparent 1px), linear-gradient(90deg, rgba(143,255,203,.11) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
