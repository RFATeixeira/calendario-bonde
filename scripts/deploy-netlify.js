#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Preparando deploy para Netlify...\n');

// Verificar se estamos no Netlify
const isNetlify = process.env.NETLIFY || process.env.NODE_ENV === 'production';

if (isNetlify) {
  console.log('🌐 Ambiente Netlify detectado');
  
  // Definir variáveis de ambiente padrão se não existirem
  const defaultEnvVars = {
    NEXT_PUBLIC_FIREBASE_API_KEY: 'placeholder',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'placeholder.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'placeholder',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'placeholder.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:123456789:web:placeholder'
  };

  // Verificar e definir variáveis faltando
  Object.entries(defaultEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`⚠️  ${key} não configurada, usando placeholder`);
    } else {
      console.log(`✅ ${key} configurada`);
    }
  });

  console.log('\n💡 Lembre-se de configurar as variáveis reais no Netlify Dashboard!');
  console.log('   Site Settings → Environment Variables\n');
}

// Executar build
console.log('🔨 Iniciando build...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('\n✅ Build concluído com sucesso!');
} catch (error) {
  console.error('\n❌ Erro no build:', error.message);
  process.exit(1);
}

console.log('\n🎉 Deploy preparado para Netlify!');