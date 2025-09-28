import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações para produção
  output: 'standalone',
  
  // Permitir origins de desenvolvimento para acesso via IP local
  allowedDevOrigins: ['192.168.4.48', '127.0.0.1', 'localhost'],
  
  // PWA e Service Worker
  serverExternalPackages: ['firebase'],
  
  // Otimizações de imagem (se necessário)
  images: {
    domains: ['lh3.googleusercontent.com'], // Para fotos do Google
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compressão
  compress: true,
  
  // Variáveis de ambiente necessárias
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
};

export default nextConfig;
