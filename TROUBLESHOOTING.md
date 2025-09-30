# 🔧 Solução: Login Infinito com Google

## 🚨 Problema Identificado
Usuários novos ficam em loop infinito de carregamento ao tentar fazer login com Google.

## 🔍 Causa Provável
1. **Firebase Auth** funciona (usuário autentica)
2. **Firestore** falha ao criar documento do usuário
3. **Loop infinito** no `onAuthStateChanged`

## ✅ Soluções Implementadas

### 1. **Logging Melhorado**
Adicionado logs detalhados no `AuthContext.tsx`:
- ✅ Tracking do processo de autenticação
- ✅ Identificação de erros específicos
- ✅ Fallback para dados básicos em caso de erro

### 2. **Tratamento de Erro Robusto**
- ✅ Try/catch em todas as operações Firestore
- ✅ Continua login mesmo se Firestore falhar
- ✅ Usa dados básicos do Firebase Auth como fallback

## 🚀 Como Aplicar as Correções

### **Passo 1: Usar Regras Firestore Simplificadas**
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione projeto "calendario-bonde"
3. Vá em **Firestore Database** > **Regras**
4. Cole as regras do arquivo `firestore-simple.rules`
5. Clique **"Publicar"**

### **Passo 2: Deploy do Código Atualizado**
```bash
npm run build
# Faça o deploy no Netlify
```

### **Passo 3: Testar Login**
1. Abra o DevTools (F12) 
2. Vá na aba **Console**
3. Tente fazer login
4. Observe os logs com emojis (👤, 📄, 🆕, etc.)

## 🔍 Debug com Console

Você verá logs como:
```
👤 Usuário autenticado: email@gmail.com
🆕 Criando novo usuário
✅ Novo usuário criado no Firestore
✅ Usuário definido no contexto
🏁 Loading finalizado
```

---

## ❌ Outros Erros Comum: "Missing or insufficient permissions"

### ✅ Solução Rápida

1. **Acesse o Firebase Console:**
   - Vá em https://console.firebase.google.com
   - Selecione seu projeto

2. **Configure as Regras do Firestore:**
   - No menu lateral, clique em "Firestore Database"
   - Clique na aba "Regras"
   - **Substitua todo o conteúdo** pelas regras abaixo:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. **Publique as Regras:**
   - Clique no botão "Publicar"
   - Aguarde a confirmação

### 🔍 Verificações Adicionais

#### ✅ 1. Verifique a Autenticação
- Certifique-se de que você fez login com Google
- Verifique se o `.env.local` está configurado corretamente

#### ✅ 2. Verifique as Variáveis de Ambiente
Abra o arquivo `.env.local` e confirme que tem algo assim:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu-projeto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
```

#### ✅ 3. Reinicie o Servidor
Após alterar as regras ou variáveis:

```bash
# Pare o servidor (Ctrl+C)
# Depois inicie novamente:
npm run dev
```

### 🚨 Se Ainda Não Funcionar

#### Opção 1: Modo de Teste (Temporário)
Cole estas regras **apenas para teste**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ATENÇÃO:** Esta regra permite acesso total. Use apenas para testar!

#### Opção 2: Verificar Console do Navegador
1. Abra F12 no navegador
2. Vá na aba "Console"
3. Procure por erros detalhados
4. Me envie a mensagem completa do erro

### 📞 Próximos Passos

Se o problema persistir, me informe:
1. Qual mensagem de erro completa aparece no console
2. Se você conseguiu configurar as regras no Firebase
3. Se as variáveis de ambiente estão corretas

**🎯 Na maioria dos casos, o problema é resolvido configurando as regras simples acima!**