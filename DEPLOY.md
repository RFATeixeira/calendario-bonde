# 🚀 Deploy no Netlify - Calendário Bonde

## 📋 Pré-requisitos

1. **Projeto Firebase configurado**
2. **Conta no Netlify**
3. **Repositório Git conectado ao Netlify**

## 🔑 Configuração das Variáveis de Ambiente

### 1. Obter as chaves do Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Configurações do Projeto** (ícone da engrenagem)
4. Na aba **Geral**, role até **Configuração do SDK**
5. Selecione **Config** e copie os valores

### 2. Configurar no Netlify

1. Acesse seu site no **Netlify Dashboard**
2. Vá em **Site Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd...
```

⚠️ **IMPORTANTE**: Use exatamente os nomes acima (incluindo `NEXT_PUBLIC_`)

## 🔧 Configurações de Build

### Configurações no Netlify Dashboard:

- **Build Command**: `npm run build`
- **Publish Directory**: `.next`
- **Node Version**: 18 ou superior

## 🔥 Configuração do Firebase

### Regras do Firestore

Certifique-se que as regras do Firestore estão configuradas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler e escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Todos os usuários autenticados podem ler todos os usuários (para o modal de seleção)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Eventos podem ser lidos por todos os usuários autenticados
    match /events/{eventId} {
      allow read: if request.auth != null;
      // Usuários podem criar eventos para si mesmos
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      // Usuários podem deletar seus próprios eventos
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
      // Admins podem criar/deletar eventos para qualquer usuário
      allow create, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Configuração de Autenticação

1. No Firebase Console, vá para **Authentication** → **Sign-in method**
2. Habilite **Google** como provedor de autenticação
3. Adicione seu domínio do Netlify nos **Authorized domains**
   - Exemplo: `https://seu-app.netlify.app`

## 🚨 Resolução de Problemas

### Erro: `Firebase: Error (auth/invalid-api-key)`

- ✅ Verifique se todas as variáveis de ambiente estão configuradas no Netlify
- ✅ Confirme se os valores das variáveis estão corretos (sem espaços extras)
- ✅ Certifique-se de usar `NEXT_PUBLIC_` no início de cada variável

### Erro de Build

- ✅ Verifique se o Node.js está na versão 18+
- ✅ Confirme se todas as dependências estão no `package.json`
- ✅ Teste o build localmente com `npm run build`

### Erro de Autenticação

- ✅ Adicione o domínio do Netlify nos domínios autorizados do Firebase
- ✅ Verifique se o Google Auth está habilitado no Firebase Console

## 📞 Deploy Manual

Se precisar fazer deploy manual:

```bash
# Build local
npm run build

# Deploy usando Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=.next
```

## 🔄 CI/CD Automático

O Netlify fará deploy automático a cada push para a branch `main` se:

- ✅ As variáveis de ambiente estiverem configuradas
- ✅ O build passar sem erros
- ✅ O repositório estiver conectado corretamente