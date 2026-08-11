'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={30} className="text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Não foi possível carregar os dados
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          {message || 'Ocorreu um erro ao conectar com o banco de dados. Verifique a conexão e tente novamente.'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}
