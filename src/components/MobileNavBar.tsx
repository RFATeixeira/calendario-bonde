'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Bell, 
  Calendar, 
  Settings, 
  User 
} from 'lucide-react';

const MobileNavBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(2); // Calendário é o padrão (índice 2)
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navItems = [
    {
      icon: Home,
      label: 'Home',
      path: '/home'
    },
    {
      icon: Bell,
      label: 'Notificações',
      path: '/notificacoes'
    },
    {
      icon: Calendar,
      label: 'Calendário',
      path: '/'
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/configuracoes'
    },
    {
      icon: User,
      label: 'Perfil',
      path: '/perfil'
    }
  ];

  // Atualiza o índice ativo baseado na rota atual
  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === pathname);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    } else if (pathname === '/') {
      // Se estiver na página inicial, define o calendário como ativo (índice 2)
      setActiveIndex(2);
    }
  }, [pathname]);

  const handleNavigation = (index: number, path: string) => {
    if (index !== activeIndex) {
      // Inicia estado de transição
      setIsTransitioning(true);
      
      // Atualiza o índice ativo imediatamente para iniciar a animação horizontal
      setActiveIndex(index);
      
      // Navega para a nova página após um pequeno delay
      setTimeout(() => {
        router.push(path);
      }, 300);
      
      // Finaliza estado de transição
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  };

  return (
    <>
      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
        {/* Container com altura total */}
        <div className="relative h-20">
          {/* Círculo azul que se move horizontalmente */}
          <div 
            className={`absolute bg-blue-500 rounded-full shadow-lg transition-all duration-500 ease-out ${
              isTransitioning ? 'animate-horizontal-slide' : ''
            }`}
            style={{
              width: '60px',
              height: '60px',
              top: '-16px',
              border: '4px solid white',
              left: `calc(${activeIndex} * (100% / 5) + (100% / 10) - 30px)`,
              zIndex: 10,
              
              boxShadow: isTransitioning 
                ? '0 12px 40px rgba(59, 130, 246, 0.7), 0 0 0 4px rgba(59, 130, 246, 0.2)' 
                : '0 8px 30px rgba(59, 130, 246, 0.4)',
              transform: `scale(${isTransitioning ? 1.05 : 1})`
            }}
          />
          
          {/* Container dos ícones com espaçamento uniforme */}
          <div className="flex items-center justify-between  relative z-20 h-full">
          {navItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = activeIndex === index;
            
            return (
              <button
                key={index}
                onClick={() => handleNavigation(index, item.path)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                style={{ 
                  width: '20%',
                  height: '64px',
                }}
                aria-label={item.label}
              >
                {/* Ícone */}
                <div className={`relative z-30 transition-all duration-300 ease-out ${
                  isActive ? 'text-white -top-6 scale-110' : 'text-gray-600 scale-100 hover:text-gray-800'
                }`}>
                  <IconComponent 
                    size={26} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
              </button>
            );
          })}
          </div>
        </div>
        
        
        
        {/* Padding bottom para dispositivos com notch */}
        <div className="h-safe-area-inset-bottom" />
      </nav>
      
      {/* Spacer para evitar sobreposição do conteúdo - aumentado para acomodar o círculo elevado */}
      <div className="h-20" />
      
      <style jsx>{`
        @keyframes horizontal-slide {
          0% { 
            transform: scale(1.05) translateX(0); 
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.7), 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          50% {
            transform: scale(1.1) translateY(-2px);
            box-shadow: 0 16px 50px rgba(59, 130, 246, 0.8), 0 0 0 6px rgba(59, 130, 246, 0.3);
          }
          100% { 
            transform: scale(1.05) translateX(0); 
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.7), 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
          }
          50% {
            box-shadow: 0 12px 40px rgba(59, 130, 246, 0.6);
          }
        }
        
        .animate-horizontal-slide {
          animation: horizontal-slide 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default MobileNavBar;