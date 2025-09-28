'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavBar from '@/components/MobileNavBar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <>
      {children}
      {user && <MobileNavBar />}
    </>
  );
};

export default LayoutWrapper;