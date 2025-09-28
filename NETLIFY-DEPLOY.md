# 🚀 Deploy no Netlify - Guia Completo

## ✅ Configuração Concluída

O projeto já está totalmente configurado para funcionar no Netlify!

## 📋 Como Fazer o Deploy

### Opção 1: Via Interface Web (Recomendado)

1. **Acesse:** https://netlify.com
2. **Clique:** "New site from Git"
3. **Conecte:** Seu repositório GitHub
4. **Configure:**
   - **Build command:** `npm run build`
   - **Publish directory:** `out`
   - **Branch:** `main`

### Opção 2: Via CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Fazer login
netlify login

# Deploy inicial
netlify deploy

# Deploy em produção
netlify deploy --prod
```

## ⚙️ Configurar Variáveis de Ambiente

**Após o primeiro deploy**, configure as variáveis no Netlify:

1. Vá para o dashboard do seu site
2. **Site configuration** → **Environment variables**
3. Adicione cada uma das variáveis:

```
NEXT_PUBLIC_FIREBASE_API_KEY=seu_valor_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=calendario-bonde.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=calendario-bonde
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=calendario-bonde.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. **Redeploy** o site após configurar as variáveis

## 🔥 Configurar Firebase

Adicione o domínio do Netlify ao Firebase:

1. **Firebase Console** → **Authentication** → **Settings**
2. Em **"Authorized domains"**, adicione:
   - `seu-site.netlify.app`
   - `seu-dominio-personalizado.com` (se tiver)

## ✨ Recursos Implementados

- ✅ Build otimizado para Netlify
- ✅ Static export configurado
- ✅ Headers de segurança
- ✅ Cache de assets otimizado
- ✅ Fallback para variáveis ausentes
- ✅ PWA pronto
- ✅ Redirects SPA configurados

## 🎯 Após o Deploy

1. Configure as variáveis de ambiente
2. Adicione domínio ao Firebase
3. Teste todas as funcionalidades
4. Configure domínio personalizado (opcional)

## 🔧 Troubleshooting

### Build Error
- Verifique se todas as variáveis foram configuradas
- Execute `npm run build` localmente primeiro

### Firebase Error
- Certifique-se que o domínio está autorizado no Firebase
- Verifique se as variáveis estão corretas

### 404 Errors
- Verifique se os redirects estão funcionando
- Confirme que `publish = "out"` está no netlify.toml

## 🎉 Pronto!

Seu projeto está configurado e pronto para o Netlify! 🚀