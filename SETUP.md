# Calendário Bonde - Configuração

## 📋 Instruções de Configuração

### 1. Configuração do Firebase

#### 1.1 Criar Projeto no Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Nomeie o projeto como "calendario-bonde" ou nome de sua preferência
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 1.2 Configurar Authentication
1. No painel do Firebase, vá em "Authentication"
2. Clique em "Começar"
3. Vá na aba "Sign-in method"
4. Ative o provedor "Google"
5. Configure o email de suporte do projeto

#### 1.3 Configurar Firestore Database
1. No painel do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. **IMPORTANTE:** Escolha "Começar no modo de teste" (mais fácil para começar)
4. Selecione a localização (recomendado: southamerica-east1 para Brasil)
5. Após criar, vá em "Regras" e substitua por estas regras simples:

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

6. Clique em "Publicar" para salvar as regras

#### 1.4 Configurar Web App
1. No painel do Firebase, vá em "Configurações do projeto" (ícone de engrenagem)
2. Na seção "Seus apps", clique no ícone da web `</>`
3. Registre o app com o nome "Calendario Bonde"
4. Copie as configurações do Firebase

### 2. Configuração do Ambiente Local

#### 2.1 Variáveis de Ambiente
1. Abra o arquivo `.env.local`
2. Substitua os valores pelas suas configurações do Firebase:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

#### 2.2 Ícones do PWA
Para que o PWA funcione completamente, você precisa adicionar os ícones:

1. Crie ícones nos seguintes tamanhos:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

2. Salve-os na pasta `public/icons/` com os nomes:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`

### 3. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

### 4. Configurar Primeiro Administrador

1. Faça login no sistema com sua conta Google
2. No Firestore Database, encontre sua entrada na coleção `users`
3. Adicione o campo `isAdmin: true` ao seu documento de usuário

### 5. Funcionalidades Implementadas

#### ✅ Sistema de Autenticação
- Login com Google
- Controle de sessão
- Logout

#### ✅ Calendário Interativo
- Visualização mensal
- Navegação entre meses
- Indicadores visuais para eventos

#### ✅ Sistema de Reservas
- Usuários podem marcar datas para si
- Validação para evitar múltiplas reservas do mesmo usuário na mesma data
- Título opcional para eventos

#### ✅ Sistema de Administração
- Administradores podem criar eventos para outros usuários
- Administradores podem deletar qualquer evento
- Interface diferenciada para admins

#### ✅ PWA (Progressive Web App)
- Instalável em dispositivos móveis
- Modo fullscreen
- Service Worker para funcionalidade offline
- Manifest configurado

#### ✅ Responsividade
- Interface otimizada para desktop e mobile
- Design responsivo com Tailwind CSS

### 6. Estrutura do Banco de Dados

#### Coleção: `users`
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  isAdmin: boolean,
  createdAt: Date,
  lastLogin: Date
}
```

#### Coleção: `events`
```typescript
{
  date: string, // formato: YYYY-MM-DD
  userId: string,
  userName: string,
  userPhoto?: string,
  title?: string,
  createdAt: Date,
  createdBy: string
}
```

### 7. Deploy

Para fazer deploy em produção, você pode usar a Vercel:

```bash
npm run build
```

Configure as variáveis de ambiente na plataforma de deploy.

### 8. Próximos Passos Opcionais

- [ ] Sistema de notificações
- [ ] Exportar eventos para calendário
- [ ] Histórico de eventos
- [ ] Configurações de horários específicos
- [ ] Sistema de categorias para eventos
- [ ] Dashboard administrativo avançado