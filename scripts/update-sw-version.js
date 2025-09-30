const fs = require('fs');
const path = require('path');

// Função para atualizar a versão do Service Worker
function updateServiceWorkerVersion() {
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  
  try {
    // Lê o arquivo atual
    let swContent = fs.readFileSync(swPath, 'utf8');
    
    // Gera nova versão baseada na data/hora atual
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    
    const newVersion = `${year}-${month}-${day}-${hour}${minute}`;
    
    // Substitui a versão antiga pela nova
    const versionRegex = /const CACHE_VERSION = '[^']+'/;
    const newVersionLine = `const CACHE_VERSION = '${newVersion}'`;
    
    if (versionRegex.test(swContent)) {
      swContent = swContent.replace(versionRegex, newVersionLine);
      
      // Escreve o arquivo atualizado
      fs.writeFileSync(swPath, swContent, 'utf8');
      
      console.log(`✅ Service Worker version updated to: ${newVersion}`);
      console.log(`📁 Updated file: ${swPath}`);
    } else {
      console.error('❌ Could not find CACHE_VERSION in sw.js');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error updating Service Worker version:', error);
    process.exit(1);
  }
}

// Executa a atualização
updateServiceWorkerVersion();