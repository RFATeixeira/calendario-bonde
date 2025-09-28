# Guia para Resolver Login via IP Local (192.168.4.48:3001)

## 🔧 Problema
O Firebase Authentication não permite login quando acessado via IP local (192.168.4.48:3001) ao invés de localhost:3001.

## ✅ Soluções

### 1. Adicionar Domínio Autorizado no Firebase Console

1. **Acesse o Firebase Console:**
   - Vá para: https://console.firebase.google.com/
   - Selecione seu projeto: `calendario-bonde`

2. **Configure os Domínios Autorizados:**
   - No menu lateral, clique em **Authentication**
   - Vá para a aba **Settings** (Configurações)
   - Role até **Authorized domains** (Domínios autorizados)
   
3. **Adicione os seguintes domínios:**
   ```
   localhost
   192.168.4.48
   127.0.0.1
   ```
   
   **IMPORTANTE:** Adicione apenas o IP/domínio, SEM a porta!

### 2. Configurar Next.js para Aceitar Conexões Externas

Modifique o script de desenvolvimento no `package.json`:

```json
{
  "scripts": {
    "dev": "next dev -H 0.0.0.0",
    "dev-local": "next dev"
  }
}
```

### 3. Variáveis de Ambiente para Desenvolvimento

Crie um arquivo `.env.development` para configurações específicas de desenvolvimento:

```bash
# Configurações para desenvolvimento local
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=calendario-bonde.firebaseapp.com
NEXTAUTH_URL=http://192.168.4.48:3001
```

## 🚀 Como Testar

1. **Pare o servidor atual:**
   ```bash
   Ctrl+C no terminal
   ```

2. **Restart com a nova configuração:**
   ```bash
   npm run dev
   ```

3. **Acesse via IP:**
   ```
   http://192.168.4.48:3001
   ```

## 🔍 Verificação de Problemas

Se ainda houver problemas, verifique:

1. **Console do navegador:** F12 > Console (procure por erros de CORS ou Firebase)
2. **Network tab:** Veja se há falhas nas requisições de autenticação
3. **Firebase Console:** Verifique se o domínio foi realmente adicionado

## 📱 Testando no Celular

Para testar a aplicação no celular na mesma rede:

1. Conecte o celular na mesma WiFi
2. Acesse: `http://192.168.4.48:3001`
3. O login deve funcionar normalmente

## ⚠️ Nota de Segurança

**IMPORTANTE:** Remova o IP `192.168.4.48` dos domínios autorizados do Firebase antes de fazer deploy em produção, deixando apenas os domínios oficiais da aplicação.