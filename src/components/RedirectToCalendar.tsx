'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const RedirectToCalendar = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Se estiver na rota raiz ou em uma rota não reconhecida, redireciona para o calendário
    if (pathname === '/' || pathname === '/calendario') {
      // Já está no calendário, não faz nada
      return;
    }
    
    // Se for a primeira visita ou refresh na página raiz, mantém no calendário
    if (pathname === '/') {
      return;
    }
  }, [pathname, router]);

  return null;
};

export default RedirectToCalendar;