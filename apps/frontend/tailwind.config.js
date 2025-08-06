/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary Colors
                background: '#121212',
                surface: '#1E1E1E',
                primary: '#00C2FF',
                secondary: '#19FFA5',
                'text-primary': '#EAEAEA',
                'text-secondary': '#B0B0B0',

                // Status Colors
                success: '#4CAF50',
                warning: '#FF9800',
                error: '#F44336',
                info: '#2196F3',

                // Gradients
                'primary-gradient': 'linear-gradient(135deg, #00C2FF 0%, #19FFA5 100%)',
                'surface-gradient': 'linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%)',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
            },
            fontSize: {
                'h1': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
                'h2': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
                'h3': ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
                'h4': ['1.25rem', { lineHeight: '1.5', fontWeight: '500' }],
                'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
            },
            borderRadius: {
                'card': '12px',
            },
            boxShadow: {
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}