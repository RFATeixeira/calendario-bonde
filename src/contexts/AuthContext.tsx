'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';

interface UserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isAdmin: boolean;
  customLetter?: string;
}

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('👤 Usuário autenticado:', firebaseUser.email);
          
          // Buscar dados adicionais do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userData: UserData;
          
          if (userDoc.exists()) {
            console.log('📄 Documento do usuário existe');
            const data = userDoc.data();
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName!,
              isAdmin: data.isAdmin || false
            };

            // Adicionar campos opcionais apenas se existirem
            if (firebaseUser.photoURL) {
              userData.photoURL = firebaseUser.photoURL;
            }
            if (data.customLetter) {
              userData.customLetter = data.customLetter;
            }
            
            // Atualizar informações do usuário se necessário
            try {
              // Preparar dados de atualização sem campos undefined
              const updateData: any = {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                lastLogin: new Date()
              };

              // Adicionar photoURL apenas se não for null/undefined
              if (firebaseUser.photoURL) {
                updateData.photoURL = firebaseUser.photoURL;
              }

              await updateDoc(doc(db, 'users', firebaseUser.uid), updateData);
              console.log('✅ Dados do usuário atualizados');
            } catch (updateError) {
              console.warn('⚠️ Erro ao atualizar dados do usuário:', updateError);
              // Continua mesmo se não conseguir atualizar
            }
          } else {
            console.log('🆕 Criando novo usuário');
            // Criar novo documento do usuário
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: firebaseUser.displayName!,
              isAdmin: false
            };

            // Adicionar photoURL apenas se existir
            if (firebaseUser.photoURL) {
              userData.photoURL = firebaseUser.photoURL;
            }
            
            try {
              // Preparar dados sem campos undefined
              const firestoreData: any = {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                isAdmin: userData.isAdmin,
                createdAt: new Date(),
                lastLogin: new Date()
              };

              // Adicionar photoURL apenas se não for undefined
              if (userData.photoURL) {
                firestoreData.photoURL = userData.photoURL;
              }

              // Adicionar customLetter apenas se não for undefined
              if (userData.customLetter) {
                firestoreData.customLetter = userData.customLetter;
              }

              await setDoc(doc(db, 'users', firebaseUser.uid), firestoreData);
              console.log('✅ Novo usuário criado no Firestore');
            } catch (createError) {
              console.error('❌ Erro ao criar usuário no Firestore:', createError);
              // Se não conseguir criar no Firestore, ainda assim permite o login
              console.log('🔄 Continuando com dados básicos do Firebase Auth');
            }
          }
          
          setUser(userData);
          console.log('✅ Usuário definido no contexto');
        } else {
          console.log('🚪 Usuário deslogado');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Erro no onAuthStateChanged:', error);
        // Em caso de erro, ainda define o usuário com dados básicos se houver
        if (firebaseUser) {
          const basicUserData: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName!,
            photoURL: firebaseUser.photoURL || undefined,
            isAdmin: false
            // customLetter omitido para evitar undefined
          };
          setUser(basicUserData);
          console.log('🆘 Usando dados básicos devido ao erro');
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
        console.log('🏁 Loading finalizado');
      }
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (typeof window !== 'undefined' && window.location.hostname === '0.0.0.0') {
        throw new Error(
          'Abra o app em http://localhost:3000 (não em 0.0.0.0) para usar login Google com popup.'
        );
      }

      console.log('🚀 Iniciando login com Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Login com Google bem-sucedido:', result.user.email);
    } catch (error: any) {
      const code = typeof error?.code === 'string' ? error.code : undefined;
      const message = typeof error?.message === 'string' ? error.message : undefined;

      console.warn('⚠️ Erro ao fazer login', {
        code: code || 'sem-code',
        message: message || 'sem-message',
      });
      
      // Tratamento específico para diferentes tipos de erro
      if (code === 'auth/popup-closed-by-user') {
        console.log('🚫 Popup fechado pelo usuário');
        throw new Error('Login cancelado pelo usuário');
      } else if (code === 'auth/popup-blocked') {
        console.log('🚫 Popup bloqueado pelo navegador');
        throw new Error('Popup bloqueado. Permita popups para este site e tente novamente.');
      } else if (code === 'auth/unauthorized-domain') {
        console.log('🚫 Domínio não autorizado');
        throw new Error('Domínio não autorizado no Firebase. Adicione este domínio em Authentication > Settings > Authorized domains.');
      } else if (code === 'auth/cancelled-popup-request') {
        console.log('🚫 Requisição de popup cancelada');
        throw new Error('Tentativa de login interrompida. Aguarde e tente novamente.');
      } else if (code === 'auth/network-request-failed') {
        console.log('🚫 Falha de rede durante o login');
        throw new Error('Falha de conexão durante o login. Verifique a internet e tente novamente.');
      } else if (code === 'auth/operation-not-allowed') {
        console.log('🚫 Provedor Google desabilitado no Firebase');
        throw new Error('Login com Google não está habilitado no Firebase Authentication.');
      } else if (code === 'auth/invalid-api-key') {
        console.log('🚫 API key inválida');
        throw new Error('Configuração inválida do Firebase (API key). Verifique as credenciais do projeto.');
      } else if (code === 'auth/internal-error') {
        console.log('⚠️ Internal error no popup');
        throw new Error(
          'Falha interna no popup de login. Verifique: 1) acesse por http://localhost:3000, 2) Google habilitado no Firebase Authentication, 3) domínio autorizado no Firebase, 4) bloqueadores/extensões desativados para este site.'
        );
      } else {
        console.log('🚫 Erro genérico:', code || 'desconhecido');
        throw new Error(`Erro ao fazer login (${code || 'desconhecido'}). ${message || 'Tente novamente.'}`);
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false); // Desativar modo admin ao fazer logout
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const toggleAdminMode = () => {
    if (user?.isAdmin) {
      setIsAdminMode(!isAdminMode);
    }
  };

  const value = {
    user,
    loading,
    isAdminMode,
    toggleAdminMode,
    signInWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}