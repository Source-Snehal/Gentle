import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Blue/green/white gradient theme
        gentle: {
          50: 'hsl(210 100% 99%)',   // Pure white with hint of blue
          100: 'hsl(195 100% 96%)',  // Very light blue-white
          200: 'hsl(185 85% 90%)',   // Light blue-green
          300: 'hsl(175 70% 80%)',   // Soft blue-green
          400: 'hsl(165 60% 65%)',   // Medium blue-green
          500: 'hsl(155 50% 50%)',   // Balanced blue-green
          600: 'hsl(145 60% 40%)',   // Deeper green-blue
          700: 'hsl(135 70% 30%)',   // Dark green
          800: 'hsl(125 80% 20%)',   // Very dark green
          900: 'hsl(115 90% 15%)',   // Deep forest green
        },
        // Additional gradient colors
        ocean: {
          50: 'hsl(200 100% 98%)',
          100: 'hsl(195 100% 95%)',
          200: 'hsl(190 95% 88%)',
          300: 'hsl(185 90% 78%)',
          400: 'hsl(180 85% 65%)',
          500: 'hsl(175 80% 50%)',
          600: 'hsl(170 85% 40%)',
          700: 'hsl(165 90% 30%)',
          800: 'hsl(160 95% 20%)',
          900: 'hsl(155 100% 15%)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}

export default config