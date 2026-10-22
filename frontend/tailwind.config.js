/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        unis: {
          // Brand Light Theme tokens (Blue-Indigo-Violet identity)
          bg: '#F7F8FC',
          card: '#FFFFFF',
          brand: '#315FEA',
          navy: '#18264B',
          indigo: '#5946D8',
          violet: '#8465ED',
          'blue-light': '#EAF0FF',
          'violet-light': '#F0ECFF',
          ink: '#172033',
          slate: '#667085',
          border: '#E3E8F2',
          highlight: '#EAF0FF',

          // Compatibility aliasing to completely overwrite legacy green palette
          forest: '#315FEA', // Royal blue brand
          sage: '#5946D8',   // Indigo
          teal: '#4378DB',

          // Functional colors
          success: '#21845A',
          warning: '#B7791F',
          error: '#C64750',

          // Brand Dark Theme tokens
          'dark-bg': '#101525',
          'dark-card': '#191F34',
          'dark-elevated': '#222A43',
          'dark-text': '#F2F4FF',
          'dark-muted': '#B5BED6',
          'dark-border': '#303A57',
          'dark-brand': '#7293FF',
          'dark-indigo': '#9281FF',
          'dark-violet': '#AD96FF',
          'dark-highlight': '#202E4D',
          'dark-forest': '#7293FF',
          'dark-sage': '#9281FF',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'button': '12px',
        'card': '18px',
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(24, 38, 75, 0.04)',
        'elevated': '0 12px 32px -4px rgba(49, 95, 234, 0.12)',
        'dark-subtle': '0 2px 10px rgba(0, 0, 0, 0.35)',
        'dark-elevated': '0 12px 32px -4px rgba(0, 0, 0, 0.55)',
      },
    },
  },
  plugins: [],
};
