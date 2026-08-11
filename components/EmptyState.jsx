'use client';

import { SearchX, Filter } from 'lucide-react';

export default function EmptyState({ onClearFilters }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-5">
          <SearchX size={30} className="text-slate-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">
          Nenhum dado encontrado
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Não encontramos registros para o período e filtros selecionados.
          Tente alterar o período ou remover alguns filtros.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
          >
            <Filter size={15} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
