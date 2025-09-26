# 🔧 Resolução do Erro de Permissão

## ❌ Erro: "Missing or insufficient permissions"

Este erro indica que as regras de segurança do Firestore não estão configuradas corretamente.

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