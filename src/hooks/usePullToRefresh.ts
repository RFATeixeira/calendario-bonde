'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // Porcentagem da tela para ativar o refresh (padrão: 40%)
  resistance?: number; // Resistência do arrasto (padrão: 2.5)
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 40,
  resistance = 2.5
}: UsePullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [initialScrollY, setInitialScrollY] = useState(0);

  // Calcula a distância máxima baseada na porcentagem da tela
  const maxPullDistance = typeof window !== 'undefined' ? (window.innerHeight * threshold) / 100 : 200;
  const shouldRefresh = pullDistance >= maxPullDistance;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Só inicia o pull se estiver no topo da página e não estiver já refreshing
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY === 0 && !isRefreshing && !isPulling) {
      setInitialScrollY(scrollY);
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
      setPullDistance(0);
    }
  }, [isRefreshing, isPulling]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;
    
    // Se saiu do topo da página, cancela o pulling
    if (currentScrollY > 0 || isRefreshing) {
      if (isPulling) {
        setIsPulling(false);
        setPullDistance(0);
      }
      return;
    }

    const touchY = e.touches[0].clientY;
    const rawDistance = touchY - startY;
    
    // Só inicia pulling se não estava puxando e movimento é para baixo significativo
    if (!isPulling && rawDistance > 10) {
      setIsPulling(true);
    }
    
    if (isPulling && rawDistance > 0) {
      setCurrentY(touchY);
      
      // Aplica resistência para tornar o arrasto mais natural
      const distance = rawDistance / resistance;
      const newPullDistance = Math.max(0, Math.min(distance, maxPullDistance * 1.2));
      setPullDistance(newPullDistance);
      
      // Previne o scroll nativo quando está puxando
      if (rawDistance > 15) {
        e.preventDefault();
        e.stopPropagation();
      }
    } else if (rawDistance <= 0 && isPulling) {
      // Se está puxando para cima, para o pulling
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [isPulling, startY, resistance, maxPullDistance, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || isRefreshing) return;

    const wasTriggered = shouldRefresh;
    setIsPulling(false);

    if (wasTriggered) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Erro durante o refresh:', error);
      }
      
      // Animação de retorno mais suave
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
        setStartY(0);
        setCurrentY(0);
      }, 800);
    } else {
      // Retorna à posição inicial se não atingiu o threshold
      setTimeout(() => {
        setPullDistance(0);
        setStartY(0);
        setCurrentY(0);
      }, 300);
    }
  }, [isPulling, shouldRefresh, isRefreshing, onRefresh]);

  useEffect(() => {
    // Usar document ao invés de body para melhor compatibilidade
    const element = document.documentElement;

    // Adicionar listeners com configurações específicas
    element.addEventListener('touchstart', handleTouchStart, { 
      passive: true,
      capture: false 
    });
    element.addEventListener('touchmove', handleTouchMove, { 
      passive: false,
      capture: false 
    });
    element.addEventListener('touchend', handleTouchEnd, { 
      passive: true,
      capture: false 
    });
    element.addEventListener('touchcancel', handleTouchEnd, { 
      passive: true,
      capture: false 
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    shouldRefresh,
    pullProgress: Math.min((pullDistance / maxPullDistance) * 100, 100)
  };
};