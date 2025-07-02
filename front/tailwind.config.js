// front/tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');


module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            fontFamily: {
                sans: ['Sora', ...defaultTheme.fontFamily.sans],
                grotesk: ['Space Grotesk', 'sans-serif'],
                neucha: ['Neucha', 'sans-serif'],
                oldstandardtt: ['OldStandardTT', 'serif'],
                scada: ['Scada', 'sans-serif'],
            },
            colors: {
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    500: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    500: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                dark: {
                    900: '#0f172a',
                    800: '#1e293b',
                    // ... остальные темные цвета
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                sidebar: {
                    DEFAULT: 'hsl(var(--sidebar-background))',
                    foreground: 'hsl(var(--sidebar-foreground))',
                    primary: 'hsl(var(--sidebar-primary))',
                    'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                    accent: 'hsl(var(--sidebar-accent))',
                    'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                    border: 'hsl(var(--sidebar-border))',
                    ring: 'hsl(var(--sidebar-ring))'
                }
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            keyframes: {
                'accordion-down': {
                    from: {
                        height: '0'
                    },
                    to: {
                        height: 'var(--radix-accordion-content-height)'
                    }
                },
                'accordion-up': {
                    from: {
                        height: 'var(--radix-accordion-content-height)'
                    },
                    to: {
                        height: '0'
                    }
                },
                'text-gradient': {
                    '0%, 100%': { 'background-position': '0% 50%' },
                    '50%': { 'background-position': '100% 50%' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            },
            backgroundImage: {
                'hero-pattern': "url('@/assets/images/hero-bg.png')",
                'grid-pattern': "url('@/assets/images/grid.png')",
                // ... другие фоновые изображения
            },
            animation: {
                'text-gradient': 'text-gradient 3s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            },
            gradientColorStops: theme => ({
                'primary': theme('colors.primary.DEFAULT'),
                'accent': theme('colors.accent.DEFAULT'),  
            })
        },
    },
    plugins: [require("tailwindcss-animate")],
}