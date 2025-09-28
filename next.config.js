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
  
  // ESLint e TypeScript
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;