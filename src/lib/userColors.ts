// Gera cores consistentes baseadas no ID do usuário
export function getUserColor(userId: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-fuchsia-500',
    'bg-rose-500',
    'bg-amber-500'
  ];

  // Usar hash simples do userId para garantir consistência
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }

  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function getUserColorDark(userId: string): string {
  const colorsDark = [
    'bg-red-600',
    'bg-blue-600', 
    'bg-green-600',
    'bg-yellow-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-indigo-600',
    'bg-orange-600',
    'bg-teal-600',
    'bg-cyan-600',
    'bg-lime-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-fuchsia-600',
    'bg-rose-600',
    'bg-amber-600'
  ];

  // Usar hash simples do userId para garantir consistência
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converter para 32bit integer
  }

  const index = Math.abs(hash) % colorsDark.length;
  return colorsDark[index];
}