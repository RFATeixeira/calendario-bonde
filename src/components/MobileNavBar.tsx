'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Calendar, Settings } from 'lucide-react';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';

const NAVIGATE_DELAY_MS = 80;
const TRANSITION_END_MS = 420;

const navItems = [
  {
    icon: Calendar,
    label: 'Calendário',
    path: '/'
  },
  {
    icon: Settings,
    label: 'Configurações',
    path: '/configuracoes'
  }
];

const MobileNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const unreadCount = useUnreadNotifications();

  // Atualiza o índice ativo baseado na rota atual
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === pathname);
    if (currentIndex !== -1) setActiveIndex(currentIndex);
  }, [pathname]);

  // Prefetch apenas das rotas ativas (calendar e configuracoes)
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.path === '/' || item.path === '/configuracoes') {
        router.prefetch(item.path);
      }
    });
  }, [router]);

  const prefetchPath = (path: string) => {
    router.prefetch(path);
  };

  const handleNavigation = (index: number, path: string) => {
    // Só permite navegação para rota principal ('/') e configurações
    if (path !== '/' && path !== '/configuracoes') return;
    if (path === pathname || index === activeIndex) return;

    setIsTransitioning(true);
    setActiveIndex(index);

    prefetchPath(path);

    setTimeout(() => {
      router.push(path);
    }, NAVIGATE_DELAY_MS);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_END_MS);
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-4 left-4 right-4 z-50">
        {/* Container com altura total */}
        <div className="relative h-16 bg-slate-950/40 backdrop-blur-xl rounded-4xl border border-slate-800/30 shadow-xl px-1 py-2">
          {/* Container dos ícones com espaçamento uniforme */}
          <div className="flex items-center justify-between relative h-full">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeIndex === index;
            
            return (
              <button
                key={index}
                onClick={() => handleNavigation(index, item.path)}
                onMouseEnter={() => prefetchPath(item.path)}
                onTouchStart={() => prefetchPath(item.path)}
                className={`relative flex flex-col items-center justify-center transition-colors duration-200 rounded-3xl ${
                  isActive ? 'bg-blue-500/80 text-white' : 'bg-slate-800/10 text-slate-400 hover:text-blue-300'
                }`}
                style={{ 
                  width: `${100 / navItems.length}%`,
                  height: '48px',
                  margin: '4px'
                }}
                aria-label={item.label}
                aria-current={isActive ? 'true' : undefined}
              >
                {/* Ícone */}
                <IconComponent 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </button>
            );
          })}
          </div>
        </div>
        
        
        
        {/* Padding bottom para dispositivos com notch */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
      
      {/* Spacer para evitar sobreposição do conteúdo */}
    </>
  );
};

export default MobileNavBar;