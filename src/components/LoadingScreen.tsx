'use client';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center animate-pulse shadow-xl">
          <img
            src="/icon/icon.png"
            alt="Calendário Bonde"
            className="h-16 w-16 rounded-md object-cover"
          />
        </div>
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-slate-300 font-medium">Carregando...</p>
        </div>
      </div>
    </div>
  );
}