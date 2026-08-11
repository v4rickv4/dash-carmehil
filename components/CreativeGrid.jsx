'use client';

import { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import CreativeCard from './CreativeCard';
import CreativeDrawer from './CreativeDrawer';
import { safeNum } from '@/lib/metrics';

export default function CreativeGrid({ rows, loading }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [onlyWithSpend, setOnlyWithSpend] = useState(true);

  // Filter rows where investimento > R$ 1.00 when onlyWithSpend is enabled
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    if (!onlyWithSpend) return rows;
    return rows.filter((row) => safeNum(row.investimento) > 1);
  }, [rows, onlyWithSpend]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="space-y-2">
            <div className="skeleton h-5 w-48 rounded-lg" />
            <div className="skeleton h-4 w-32 rounded-lg" />
          </div>
          <div className="skeleton h-9 w-44 rounded-xl" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton" style={{ aspectRatio: '4/3' }} />
              <div className="bg-white p-4 space-y-3 border border-slate-200 border-t-0 rounded-b-2xl">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="grid grid-cols-2 gap-2">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton h-12 rounded-lg" />
                  ))}
                </div>
                <div className="skeleton h-9 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Section Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Performance dos Criativos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredRows.length}{' '}
            {filteredRows.length === 1 ? 'criativo' : 'criativos'}{' '}
            {onlyWithSpend ? 'com veiculação (> R$ 1,00)' : 'no período'}
          </p>
        </div>

        {/* Filter button: toggle spend > R$ 1.00 */}
        <button
          onClick={() => setOnlyWithSpend((v) => !v)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
            onlyWithSpend
              ? 'bg-ocean-50 text-ocean-700 border-ocean-200 shadow-sm hover:bg-ocean-100'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
          aria-pressed={onlyWithSpend}
        >
          <Filter size={14} className={onlyWithSpend ? 'text-ocean-600' : 'text-slate-400'} />
          <span>Com gastos (&gt; R$ 1,00)</span>
          <span
            className={`w-2 h-2 rounded-full ${
              onlyWithSpend ? 'bg-ocean-500' : 'bg-slate-300'
            }`}
          />
        </button>
      </div>

      {/* Grid or Empty state */}
      {!filteredRows || filteredRows.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm space-y-3">
          <p className="font-medium text-slate-700">
            Nenhum criativo encontrado {onlyWithSpend ? 'com gasto superior a R$ 1,00' : 'no período'}.
          </p>
          {onlyWithSpend && (
            <button
              onClick={() => setOnlyWithSpend(false)}
              className="text-xs text-ocean-600 font-semibold hover:underline"
            >
              Exibir todos os criativos
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 section-animate">
          {filteredRows.map((row) => (
            <CreativeCard
              key={row.id}
              row={row}
              onOpenDrawer={setSelectedRow}
            />
          ))}
        </div>
      )}

      {selectedRow && (
        <CreativeDrawer
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      )}
    </div>
  );
}
