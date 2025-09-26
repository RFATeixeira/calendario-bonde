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
      if (firebaseUser) {
        // Buscar dados adicionais do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        let userData: UserData;
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName!,
            photoURL: firebaseUser.photoURL || undefined,
            isAdmin: data.isAdmin || false
          };
          
          // Atualizar informações do usuário se necessário
          await updateDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            lastLogin: new Date()
          });
        } else {
          // Criar novo documento do usuário
          userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName!,
            photoURL: firebaseUser.photoURL || undefined,
            isAdmin: false
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userData,
            createdAt: new Date(),
            lastLogin: new Date()
          });
        }
        
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
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