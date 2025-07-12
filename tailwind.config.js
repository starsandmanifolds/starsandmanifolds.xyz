/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern color palette with good contrast for both light and dark modes
        'primary': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        'neutral': {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', 'monospace'],
        decorative: ['Dancing Script', 'cursive']
      },
      backgroundColor: {
        'light': '#ffffff',
        'dark': '#0a0a0a'
      },
      textColor: {
        'light': '#171717',
        'dark': '#fafafa'
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.neutral.700'),
            h1: {
              color: theme('colors.neutral.900'),
              fontWeight: '700',
            },
            h2: {
              color: theme('colors.neutral.900'),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.neutral.900'),
              fontWeight: '600',
            },
            strong: {
              color: theme('colors.neutral.900'),
            },
            a: {
              color: theme('colors.primary.600'),
              '&:hover': {
                color: theme('colors.primary.700'),
              },
            },
            code: {
              color: theme('colors.neutral.900'),
              backgroundColor: theme('colors.neutral.100'),
              paddingLeft: '0.25rem',
              paddingRight: '0.25rem',
              paddingTop: '0.125rem',
              paddingBottom: '0.125rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: theme('colors.neutral.900'),
              color: theme('colors.neutral.100'),
              overflow: 'auto',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              fontSize: '0.875rem',
              fontWeight: '400',
              padding: '0',
            },
            blockquote: {
              color: theme('colors.neutral.700'),
              borderLeftColor: theme('colors.neutral.300'),
            },
          },
        },
        invert: {
          css: {
            color: theme('colors.neutral.300'),
            h1: {
              color: theme('colors.neutral.100'),
            },
            h2: {
              color: theme('colors.neutral.100'),
            },
            h3: {
              color: theme('colors.neutral.100'),
            },
            strong: {
              color: theme('colors.neutral.100'),
            },
            a: {
              color: theme('colors.primary.400'),
              '&:hover': {
                color: theme('colors.primary.300'),
              },
            },
            code: {
              color: theme('colors.neutral.100'),
              backgroundColor: theme('colors.neutral.800'),
            },
            pre: {
              backgroundColor: theme('colors.neutral.950'),
              color: theme('colors.neutral.100'),
            },
            blockquote: {
              color: theme('colors.neutral.400'),
              borderLeftColor: theme('colors.neutral.700'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};