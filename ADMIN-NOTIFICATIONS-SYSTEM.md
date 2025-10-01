# 🛡️ Sistema de Administração - Notificações

## ✅ **Implementação Completa**

### **Funcionalidades:**
- ✅ Botão "Criar Notificação" visível apenas para admins
- ✅ Modal com formulário completo para criação de notificações
- ✅ Suporte a diferentes tipos de notificação (sistema, evento, lembrete)
- ✅ Envio para todos os usuários ou usuários específicos
- ✅ Integração com Firestore e atualizações em tempo real
- ✅ Validação de formulário e estados de loading
- ✅ **NOVO:** Botão admin para deletar TODAS as notificações do sistema
- ✅ **NOVO:** Confirmação dupla para operações críticas de admin

### **Como Usar:**
1. **Login como Admin:** Primeiro, você precisa ser definido como administrador
2. **Acessar Notificações:** Ir para `/notificacoes`
3. **Criar Notificação:** Clicar no botão verde "Criar Notificação"
4. **Preencher Formulário:**
   - Tipo: Sistema, Evento ou Lembrete
   - Título: Título da notificação
   - Mensagem: Conteúdo da notificação
   - Destinatários: Todos os usuários ou específicos
5. **Enviar:** Clicar em "Criar Notificação"

### **🗑️ Deletar Todas as Notificações (Admin):**
1. **Acesso Restrito:** Botão vermelho visível apenas para admins
2. **Localização:** Abaixo dos botões normais de ação
3. **Confirmação Dupla:** 
   - Primeira confirmação: "⚠️ ADMIN: Tem certeza que deseja apagar TODAS as notificações..."
   - Segunda confirmação: "⚠️ CONFIRMAÇÃO FINAL: Esta ação irá apagar todas as notificações..."
4. **Resultado:** Remove todas as notificações de todos os usuários do sistema

---

## 🔧 **Como Definir um Usuário como Admin**

### **Opção 1: Firebase Console (Recomendado)**
1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em **Firestore Database**
4. Encontre a coleção `users`
5. Encontre o documento do usuário (pelo UID)
6. Adicione/edite o campo `isAdmin` para `true`

### **Opção 2: Script Automático**
1. Baixe a chave de service account do Firebase:
   - Firebase Console > Configurações do Projeto > Contas de Serviço
   - Gerar nova chave privada
   - Salve como `scripts/service-account-key.json`
2. Instale dependências: `npm install firebase-admin`
3. Execute: `node scripts/set-admin.js SEU_EMAIL@gmail.com`

### **Opção 3: Código Temporário (Desenvolvimento)**
Adicione temporariamente no AuthContext.tsx:
```tsx
// APENAS PARA DESENVOLVIMENTO - REMOVER EM PRODUÇÃO
if (firebaseUser.email === 'SEU_EMAIL@gmail.com') {
  userData.isAdmin = true;
}
```

---

## 🏗️ **Arquitetura Técnica**

### **Componentes:**
- **NotificacoesPage:** Página principal com lista de notificações
- **Admin Button:** Botão verde "Criar Notificação" (apenas admins)
- **Admin Modal:** Modal com formulário de criação
- **Form Handling:** Estado reativo com validação

### **Fluxo de Dados:**
1. **Verificação Admin:** `user?.isAdmin` no contexto
2. **Formulário:** Estado local com `adminForm`
3. **Firestore Write:** Loop para criar notificação para cada usuário
4. **Update Real-time:** Atualizações automáticas via listeners

### **Firestore Schema:**
```javascript
// Coleção: notifications
{
  type: 'sistema' | 'evento' | 'lembrete',
  title: string,
  message: string,
  read: boolean,
  createdAt: Date,
  userId: string  // ID do usuário destinatário
}
```

### **Firestore Rules:**
```javascript
// Usuários podem ler/editar suas notificações
match /notifications/{notificationId} {
  allow read, update, delete: if request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
}
```

---

## 🚀 **Status do Sistema**

### **✅ Implementado:**
- Interface de admin (botão + modal)
- Formulário com validação
- Integração Firestore (criar notificações)
- Envio para todos os usuários
- Estados de loading e erro
- Regras de segurança Firestore
- **NOVO:** Botão admin para deletar todas as notificações
- **NOVO:** Função `clearAllNotificationsAdmin()` com confirmação dupla
- **NOVO:** Regras Firestore para admins deleterem qualquer notificação

### **🔄 Melhorias Futuras:**
- Seleção de usuários específicos
- Preview de notificação
- Histórico de notificações enviadas
- Estatísticas de leitura
- Agendamento de notificações

---

## 🧪 **Como Testar**

### **1. Configurar Admin:**
- Defina seu usuário como admin (ver opções acima)
- Faça login no sistema

### **2. Testar Criação:**
- Vá para `/notificacoes`
- Verifique se o botão verde "Criar Notificação" aparece
- Clique e preencha o formulário
- Envie e verifique se as notificações foram criadas

### **3. Testar Recebimento:**
- Login com outro usuário (não-admin)
- Vá para `/notificacoes`
- Verifique se recebeu a notificação
- Teste marcar como lida

### **4. Verificar Segurança:**
- Login com usuário não-admin
- Verifique se o botão NÃO aparece
- Teste via console se consegue criar (deve dar erro)

---

## 📝 **Logs e Debug**

### **Console Logs:**
```javascript
// Quando admin cria notificação
"Creating notification:" {type, title, message, targetType}
"Notificação criada para X usuários"

// Em caso de erro
"Erro ao criar notificação:" error
```

### **Verificar no Firebase:**
- Firestore > notifications (deve ter documentos criados)
- Authentication > Users (verificar isAdmin = true)
- Rules > Playground (testar permissões)

---

## 🎯 **Considerações de Produção**

### **Segurança:**
- ✅ Regras Firestore impedem criação por não-admins
- ✅ Interface oculta para não-admins
- ✅ Validação server-side via Firestore Rules

### **Performance:**
- ✅ Criação em lote com Promise.all
- ✅ Estados de loading para UX
- ✅ Validação client-side antes de enviar

### **Escalabilidade:**
- 🔄 Para muitos usuários, considere Cloud Functions
- 🔄 Implementar filas para processar em background
- 🔄 Adicionar rate limiting para admins