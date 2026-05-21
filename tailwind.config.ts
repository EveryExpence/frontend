/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        theme: {
          text: 'var(--theme-text)',
          background: 'var(--theme-background)',
          tint: 'var(--theme-tint)',
          surface: 'var(--theme-surface)',
          icon: 'var(--theme-icon)',
          textLight: 'var(--theme-text-light)',
          textDark: 'var(--theme-text-dark)',
          error: 'var(--theme-error)',
          warning: 'var(--theme-warning)',
          success: 'var(--theme-success)',
        }
      }
    },
  },
  plugins: [],
}