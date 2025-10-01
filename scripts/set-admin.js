// Script para definir um usuário como administrador
// Execute com: node scripts/set-admin.js EMAIL_DO_USUARIO

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin (você precisará configurar as credenciais)
// Para usar este script, você precisa:
// 1. Baixar a chave de service account do Firebase Console
// 2. Colocar o arquivo JSON na pasta scripts/ 
// 3. Renomear para service-account-key.json

try {
  const serviceAccount = require('./service-account-key.json');
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  
  async function setUserAsAdmin(email) {
    try {
      console.log(`🔍 Procurando usuário com email: ${email}`);
      
      // Buscar usuário por email
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email).get();
      
      if (snapshot.empty) {
        console.log('❌ Usuário não encontrado');
        return;
      }
      
      const userDoc = snapshot.docs[0];
      console.log(`✅ Usuário encontrado: ${userDoc.id}`);
      
      // Definir como admin
      await userDoc.ref.update({
        isAdmin: true
      });
      
      console.log('🎉 Usuário definido como administrador com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro:', error);
    }
  }
  
  // Pegar email dos argumentos da linha de comando
  const email = process.argv[2];
  
  if (!email) {
    console.log('📝 Uso: node scripts/set-admin.js EMAIL_DO_USUARIO');
    console.log('📝 Exemplo: node scripts/set-admin.js usuario@gmail.com');
    process.exit(1);
  }
  
  setUserAsAdmin(email).then(() => {
    process.exit(0);
  });
  
} catch (error) {
  console.log('⚠️  Para usar este script, você precisa:');
  console.log('1. Baixar a chave de service account do Firebase Console');
  console.log('2. Colocar o arquivo JSON na pasta scripts/');
  console.log('3. Renomear para service-account-key.json');
  console.log('4. Instalar firebase-admin: npm install firebase-admin');
  console.log('');
  console.log('❌ Erro ao carregar credenciais:', error.message);
}