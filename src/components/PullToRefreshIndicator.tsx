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
          pullProgress > 80 ? 'rotate-180' : ''
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${getBackgroundOpacity()}`}
      style={{
        transform: `translateY(${Math.max(0, pullDistance - 80)}px)`,
        opacity: Math.min(pullProgress / 100, 1)
      }}
    >
      <div className="flex flex-col items-center justify-center py-4 px-6">
        {/* Indicador circular com progresso */}
        <div className="relative mb-2">
          <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className={getTextColor()}>
              {getIcon()}
            </div>
          </div>
          
          {/* Anel de progresso */}
          {!isRefreshing && (
            <svg
              className="absolute top-0 left-0 w-12 h-12 -rotate-90"
              viewBox="0 0 48 48"
            >
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className={shouldRefresh ? 'text-green-500' : 'text-blue-500'}
                style={{
                  strokeDasharray: `${2 * Math.PI * 20}`,
                  strokeDashoffset: `${2 * Math.PI * 20 * (1 - pullProgress / 100)}`,
                  transition: 'stroke-dashoffset 0.1s ease-out'
                }}
              />
            </svg>
          )}
        </div>

        {/* Texto */}
        <p className={`text-sm font-medium ${getTextColor()}`}>
          {getText()}
        </p>

        {/* Barra de progresso */}
        <div className="w-20 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
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