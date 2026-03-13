/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors (Official)
        brand: {
          dark: '#14152D',
          cyan: '#43C7F4',
          purple: '#606DB4',
        },
        // Surfaces
        surface: {
          white: '#ffffff',
          light: '#f6f8fa',
          cream: '#fafbfc',
        },
        // Borders
        border: {
          DEFAULT: '#e8ecf1',
          light: '#f1f5f9',
        },
        // Text
        text: {
          primary: '#0d0c2c',
          secondary: '#64748b',
          muted: '#94a3b8',
        },
        // Status
        success: {
          DEFAULT: '#10b981',
          bg: '#d1fae5',
        },
        warning: {
          DEFAULT: '#f59e0b',
          bg: '#fef3c7',
        },
        error: {
          DEFAULT: '#ef4444',
          bg: '#fee2e2',
        },
        // Badge Colors
        badge: {
          'blue-bg': '#dbeafe',
          'blue-text': '#1e40af',
          'purple-bg': '#ede9fe',
          'purple-text': '#6d28d9',
          'green-bg': '#d1fae5',
          'green-text': '#065f46',
          'orange-bg': '#fff7ed',
          'yellow-bg': '#fefce8',
        },
      },
      spacing: {
        // 8pt scale
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
      },
      borderRadius: {
        'none': '0',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '9999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 14, 37, 0.05)',
        'md': '0 2px 8px rgba(0, 14, 37, 0.08)',
        'lg': '0 4px 12px rgba(0, 14, 37, 0.12)',
        'xl': '0 8px 24px rgba(0, 14, 37, 0.15)',
        'cyan-glow': '0 4px 12px rgba(67, 199, 244, 0.3)',
        'sidebar': '-4px 0 24px rgba(0, 14, 37, 0.15)',
      },
      fontSize: {
        'xs': '11px',
        'sm': '12px',
        'base': '14px',
        'lg': '16px',
        'xl': '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '28px',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
        'expand': '500ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
