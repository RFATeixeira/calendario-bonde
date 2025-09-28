#!/usr/bin/env node

// Carrega variáveis de ambiente do .env.local
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'
];console.log('🔍 Verificando variáveis de ambiente...\n');

const missingVars = [];
const presentVars = [];

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    presentVars.push(varName);
    console.log(`✅ ${varName}: Configurada`);
  } else {
    missingVars.push(varName);
    console.log(`❌ ${varName}: NÃO CONFIGURADA`);
  }
});

console.log(`\n📊 Resumo:`);
console.log(`✅ Configuradas: ${presentVars.length}`);
console.log(`❌ Faltando: ${missingVars.length}`);

if (missingVars.length > 0) {
  console.log(`\n🚨 Variáveis faltando:`);
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  
  console.log(`\n💡 Como resolver:`);
  console.log(`1. Crie um arquivo .env.local na raiz do projeto`);
  console.log(`2. Adicione as variáveis faltando (veja .env.example)`);
  console.log(`3. Para Netlify: Site Settings > Environment Variables`);
  
  // Para Netlify, permitir continuar o build mesmo sem as variáveis
  if (process.env.NETLIFY || process.env.NODE_ENV === 'production') {
    console.log(`\n🌐 Detectado ambiente de produção - continuando build...`);
    console.log(`⚠️  Configure as variáveis de ambiente após o primeiro deploy!`);
  } else {
    // Localmente, falha se não tiver as variáveis
    process.exit(1);
  }
} else {
  console.log(`\n🎉 Todas as variáveis estão configuradas!`);
  process.exit(0);
}