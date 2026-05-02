'use client';

import React from 'react';
import MobileNavBar from '@/components/MobileNavBar';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div>
      {children}
      <MobileNavBar />
    </div>
  );
};

export default LayoutWrapper;