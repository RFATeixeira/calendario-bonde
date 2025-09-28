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
  const [waveAnimation, setWaveAnimation] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [waveExiting, setWaveExiting] = useState(false);

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
      
      // Reset estados de wave se já estiverem ativos
      setWaveExiting(false);
      
      // Ativa animação de wave
      setWaveAnimation(true);
      
      // Pequeno delay antes de mudar o índice para suavizar a transição
      setTimeout(() => {
        setActiveIndex(index);
      }, 100);
      
      // Navega para a nova página
      setTimeout(() => {
        router.push(path);
      }, 200);
      
      // Inicia animação de saída do wave
      setTimeout(() => {
        setWaveExiting(true);
      }, 400);
      
      // Remove wave animation após a animação de saída
      setTimeout(() => {
        setWaveAnimation(false);
        setWaveExiting(false);
      }, 1200);
      
      // Finaliza estado de transição
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1400);
    }
  };

  return (
    <>
      {/* Wave Animation Overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-40 transition-all duration-800 ease-in-out ${
          waveAnimation ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div 
          className={`absolute bottom-0 left-0 right-0 h-screen bg-gradient-to-t from-blue-400/30 via-blue-300/20 to-transparent transform ${
            waveExiting 
              ? 'wave-fade-out' 
              : waveAnimation 
                ? 'translate-y-0 scale-100 transition-all duration-800 ease-in-out' 
                : 'translate-y-full scale-85 transition-all duration-800 ease-in-out'
          }`}
          style={{
            clipPath: 'ellipse(120% 100% at 50% 100%)',
          }}
        />
      </div>

      {/* Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg">
        {/* Container com altura total */}
        <div className="relative h-20">
          {/* Círculo azul que se move - elevado para sair da navbar */}
          <div 
            className={`absolute bg-blue-500 rounded-full shadow-lg transition-all duration-700 ease-in-out ${
              isTransitioning ? 'scale-100 animate-slide-up' : 'scale-100'
            }`}
            style={{
              width: '60px',
              height: '60px',
              top: '-16px',
              border: '6px solid var(--clr)',
              left: `calc(${activeIndex} * (100% / 5) + (100% / 10) - 30px)`,
              zIndex: 10,
              
              boxShadow: isTransitioning 
                ? '0 12px 40px rgba(59, 130, 246, 0.6)' 
                : '0 8px 30px rgba(59, 130, 246, 0.4)',
              transform: `scale(${isTransitioning ? 1.1 : 1})`
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
                className={`relative flex flex-col items-center justify-center transition-all duration-500 ease-out ${
                  isActive ? 'scale-105' : 'scale-100 '
                } ${isTransitioning && isActive ? 'animate-slide-up' : ''}`}
                style={{ 
                  width: '20%',
                  height: '64px',
                }}
                aria-label={item.label}
              >
                {/* Ícone */}
                <div className={`relative z-30 transition-all duration-500 ease-out ${
                  isActive ? 'text-white -top-6 scale-110' : 'text-gray-600 scale-100'
                } ${isTransitioning && isActive ? 'animate-slide-up-icon' : ''}`}>
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
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          0% { 
            transform: translateY(20px); 
            opacity: 0.7; 
          }
          50% {
            transform: translateY(-5px);
            opacity: 0.9;
          }
          100% { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }
        
        @keyframes slide-up-icon {
          0% { 
            transform: translateY(20px) scale(0.8); 
            opacity: 0.6; 
          }
          70% {
            transform: translateY(-5px) scale(1.1);
            opacity: 1;
          }
          100% { 
            transform: translateY(0px) scale(1.1); 
            opacity: 1; 
          }
        }
        
        @keyframes wave-fade-out {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
          100% { 
            opacity: 0; 
            transform: translateY(100%) scale(0.85); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .animate-slide-up-icon {
          animation: slide-up-icon 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        .wave-fade-out {
          animation: wave-fade-out 0.8s ease-in-out forwards;
        }
      `}</style>
    </>
  );
};

export default MobileNavBar;