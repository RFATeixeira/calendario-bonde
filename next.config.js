/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para Netlify
  output: process.env.NETLIFY ? 'export' : 'standalone',
  trailingSlash: true,
  
  // Otimizações de imagem
  images: {
    unoptimized: process.env.NETLIFY ? true : false,
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compressão
  compress: true,
  
  // Headers para controle de cache
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400' // 24 horas
          }
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      },
      // Headers específicos para PWA
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, must-revalidate'
          }
        ],
      }
    ]
  },
  
  // ESLint e TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;