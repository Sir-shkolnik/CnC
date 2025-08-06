/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ['@heroicons/react', 'lucide-react']
    },

    // Suppress React DevTools warning in development
    reactStrictMode: false,
    swcMinify: true,

    // PWA Configuration
    async headers() {
        return [{
            source: '/service-worker.js',
            headers: [{
                key: 'Cache-Control',
                value: 'public, max-age=0, must-revalidate'
            }]
        }];
    },

    // Image optimization
    images: {
        domains: ['localhost', 'your-domain.com'],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },

    // Bundle analyzer
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            config.optimization.splitChunks.cacheGroups = {
                ...config.optimization.splitChunks.cacheGroups,
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            };
        }
        return config;
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
    }
};

module.exports = nextConfig;