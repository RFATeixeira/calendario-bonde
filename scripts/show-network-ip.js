const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Procura por IPv4 não loopback
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  
  return 'localhost';
}

const networkIP = getNetworkIP();
console.log('\n🌐 Servidor disponível em:');
console.log(`   Local:   http://localhost:3000`);
console.log(`   Rede:    http://${networkIP}:3000`);
console.log('\n📱 Para acessar no celular, use o endereço "Rede" acima');
console.log('\n⚠️  IMPORTANTE: Adicione o IP no Firebase Console:');
console.log(`   1. Vá para: https://console.firebase.google.com/`);
console.log(`   2. Authentication > Settings > Authorized domains`);
console.log(`   3. Adicione: ${networkIP}`);
console.log('');