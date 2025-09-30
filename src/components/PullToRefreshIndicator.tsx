'use client';

import React from 'react';
import { RotateCcw, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  shouldRefresh: boolean;
  pullProgress: number;
}

export default function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
  shouldRefresh,
  pullProgress
}: PullToRefreshIndicatorProps) {
  if (!isPulling && !isRefreshing) return null;

  const getIcon = () => {
    if (isRefreshing) {
      return <RotateCcw className="w-6 h-6 animate-spin" />;
    }
    
    if (shouldRefresh) {
      return <Check className="w-6 h-6 text-green-500" />;
    }
    
    return (
      <ArrowDown 
        className={`w-6 h-6 transition-transform duration-200 ${
          pullProgress > 50 ? 'rotate-180' : '' // Roda mais cedo
        }`} 
      />
    );
  };

  const getText = () => {
    if (isRefreshing) return 'Recarregando...';
    if (shouldRefresh) return 'Solte para recarregar';
    return 'Puxe para recarregar';
  };

  const getBackgroundOpacity = () => {
    if (isRefreshing) return 'bg-blue-50';
    if (shouldRefresh) return 'bg-green-50';
    return 'bg-gray-50';
  };

  const getTextColor = () => {
    if (isRefreshing) return 'text-blue-600';
    if (shouldRefresh) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-out ${getBackgroundOpacity()}`}
      style={{
        top: '0px',
        transform: `translateY(${Math.max(-60, Math.min(0, pullDistance - 60))}px)`,
        opacity: Math.min(pullProgress / 20, 1), // Aparece ainda mais cedo
        pointerEvents: 'none'
      }}
    >
      <div className="flex flex-col items-center justify-center py-3 px-6">
        {/* Indicador circular com progresso */}
        <div className="relative mb-1">
          <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className={getTextColor()}>
              {getIcon()}
            </div>
          </div>
          
          {/* Anel de progresso */}
          {!isRefreshing && (
            <svg
              className="absolute top-0 left-0 w-10 h-10 -rotate-90"
              viewBox="0 0 40 40"
            >
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={shouldRefresh ? 'text-green-500' : 'text-blue-500'}
                style={{
                  strokeDasharray: `${2 * Math.PI * 16}`,
                  strokeDashoffset: `${2 * Math.PI * 16 * (1 - pullProgress / 100)}`,
                  transition: 'stroke-dashoffset 0.1s ease-out'
                }}
              />
            </svg>
          )}
        </div>

        {/* Texto */}
        <p className={`text-xs font-medium ${getTextColor()}`}>
          {getText()}
        </p>

        {/* Barra de progresso */}
        <div className="w-16 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ease-out ${
              shouldRefresh ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${pullProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}