'use client';

import React from 'react';
import { RefreshCw, Download, X, AlertCircle } from 'lucide-react';
import { useAppUpdate } from '@/hooks/useAppUpdate';

export default function UpdateNotification() {
  const { updateAvailable, applyUpdate, dismissUpdate, forceReload } = useAppUpdate();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-md mx-auto p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Download className="w-6 h-6 animate-bounce" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              Nova versão disponível!
            </p>
            <p className="text-xs text-blue-100 mt-1">
              Atualize para ter acesso às últimas funcionalidades
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={applyUpdate}
              className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Atualizar</span>
            </button>
            
            <button
              onClick={dismissUpdate}
              className="text-white/80 hover:text-white p-1.5"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Botão adicional para forçar reload em caso de problemas */}
        <div className="mt-3 pt-3 border-t border-blue-500/30">
          <button
            onClick={forceReload}
            className="flex items-center space-x-2 text-xs text-blue-100 hover:text-white transition-colors"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Problemas com a atualização? Clique aqui para forçar</span>
          </button>
        </div>
      </div>
    </div>
  );
}