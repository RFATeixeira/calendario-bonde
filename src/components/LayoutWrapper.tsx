'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavBar from '@/components/MobileNavBar';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import PullToRefreshIndicator from '@/components/PullToRefreshIndicator';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { user } = useAuth();

  // Global pull-to-refresh handler
  const handleGlobalRefresh = async () => {
    // Simply reload the page for global refresh
    window.location.reload();
  };

  const {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh,
    pullProgress
  } = usePullToRefresh({
    onRefresh: handleGlobalRefresh,
    threshold: 15 // 15% da tela
  });

  return (
    <div>
      <PullToRefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        shouldRefresh={shouldRefresh}
        pullProgress={pullProgress}
      />
      {children}
      {user && <MobileNavBar />}
    </div>
  );
};

export default LayoutWrapper;