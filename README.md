# 📅 Calendário Bonde

Um sistema de calendário compartilhado desenvolvido com Next.js, Firebase e PWA, permitindo que usuários façam agendamentos e administradores gerenciem reservas de forma colaborativa.

## 🚀 Funcionalidades

### ✅ Autenticação
- Login seguro com Google
- Controle de sessão automático
- Sistema de permissões (usuário/admin)

### ✅ Calendário Interativo
- Interface responsiva e intuitiva
- Navegação entre meses
- Visualização clara de eventos
- Indicadores visuais para diferentes tipos de reservas

### ✅ Sistema de Reservas
- Usuários podem marcar datas para si
- Validação automática (1 reserva por usuário/data)
- Títulos opcionais para eventos
- Exclusão de próprias reservas

### ✅ Administração
- Admins podem criar reservas para qualquer usuário
- Gerenciamento completo de todos os eventos
- Interface diferenciada para administradores

### ✅ PWA (Progressive Web App)
- Instalável em dispositivos móveis (iOS/Android)
- Modo fullscreen para melhor experiência
- Funcionamento offline básico
- Service Worker integrado

### ✅ Design Responsivo
- Otimizado para desktop e mobile
- Interface touch-friendly
- Suporte a safe areas (iPhone X+)

## 🛠️ Tecnologias

- **Frontend:** Next.js 15, React 19, TypeScript
- **Backend:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS
- **Ícones:** Lucide React
- **Datas:** date-fns
- **PWA:** Service Worker + Web App Manifest

## 📦 Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd calendario-bonde
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o Firebase:
   - Siga as instruções detalhadas no arquivo `SETUP.md`
   - Configure as variáveis de ambiente no `.env.local`

4. Execute o projeto:
```bash
npm run dev
```

5. Acesse `http://localhost:3000`

## ⚙️ Configuração

Consulte o arquivo `SETUP.md` para instruções completas de:
- Configuração do Firebase
- Regras de segurança do Firestore
- Configuração do PWA
- Deploy em produção

## 📱 Instalação como PWA

### iOS (iPhone/iPad)
1. Abra no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"

### Android
1. Abra no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"

## 🗂️ Estrutura do Projeto

```
src/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal
│   ├── globals.css         # Estilos globais
│   └── offline/            # Página offline
├── components/
│   ├── Calendar.tsx        # Componente do calendário
│   ├── EventModal.tsx      # Modal de eventos
│   ├── Header.tsx          # Cabeçalho
│   ├── LoginComponent.tsx  # Tela de login
│   └── LoadingScreen.tsx   # Tela de carregamento
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação
└── lib/
    └── firebase.ts         # Configuração do Firebase
```

## 🔒 Segurança

- Autenticação obrigatória para todas as operações
- Regras de segurança no Firestore
- Validações no frontend e backend
- Proteção contra acessos não autorizados

## 🎨 Design System

- Paleta de cores azul/verde para diferentes tipos de eventos
- Tipografia consistente (Geist)
- Componentes reutilizáveis
- Feedback visual em todas as ações

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
```

Configure as variáveis de ambiente na plataforma:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 📝 Como Usar

1. **Login:** Faça login com sua conta Google
2. **Visualizar:** Navegue pelo calendário para ver eventos existentes
3. **Criar Evento:** Clique em uma data para criar um novo agendamento
4. **Gerenciar:** Admins podem criar/editar/excluir eventos de qualquer usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, envie um email para [seu-email] ou abra uma issue no GitHub.
