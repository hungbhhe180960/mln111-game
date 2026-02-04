export default {
    content: [
        './index.html',
        './src/**/*.{ts,tsx,js,jsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3B82F6',
                    600: '#2563EB',
                    400: '#60A5FA',
                },
                danger: {
                    DEFAULT: '#EF4444',
                    600: '#DC2626',
                },
                success: {
                    DEFAULT: '#10B981',
                    600: '#059669',
                },
                neutral: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    300: '#D1D5DB',
                    700: '#374151',
                    900: '#111827',
                },
            },
            fontFamily: {
                sans: ['Noto Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                display: ['Noto Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            keyframes: {
                fade: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(12px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                shake: {
                    '0%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-6px)' },
                    '50%': { transform: 'translateX(6px)' },
                    '75%': { transform: 'translateX(-3px)' },
                    '100%': { transform: 'translateX(0)' },
                },
            },
            animation: {
                fade: 'fade 400ms ease-out both',
                'slide-up': 'slideUp 300ms cubic-bezier(.2,.8,.2,1) both',
                shake: 'shake 600ms ease-in-out both',
            },
        },
    },
    plugins: [],
}
