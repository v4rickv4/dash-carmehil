'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import CreativeCard from './CreativeCard';
import CreativeDrawer from './CreativeDrawer';
import { groupByCreative } from '@/lib/metrics';

export default function CreativeGrid({ campaignFilter, refreshTrigger }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [creativeRows, setCreativeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest 24h creatives data from DB (independent of global date range)
  const fetchCreatives = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('latestOnly', 'true');
      if (campaignFilter) params.set('campaign', campaignFilter);

      const res = await fetch(`/api/ads?${params.toString()}`);
      if (!res.ok) throw new Error('Erro ao carregar criativos');
      const data = await res.json();
      setCreativeRows(data.rows || []);
    } catch (err) {
      console.error('[CreativeGrid] fetch error:', err);
      setError(err.message || 'Erro ao carregar criativos.');
    } finally {
      setLoading(false);
    }
  }, [campaignFilter]);

  useEffect(() => {
    fetchCreatives();
  }, [fetchCreatives, refreshTrigger]);

  // Group raw 24h rows by creative
  const groupedCreatives = useMemo(() => {
    return groupByCreative(creativeRows);
  }, [creativeRows]);

  // Always filter 24h creatives by investment > R$ 1.00 automatically behind the scenes
  const filteredCreatives = useMemo(() => {
    return groupedCreatives.filter((c) => c.investimento > 1.00);
  }, [groupedCreatives]);

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
      {/* Section Header & Permanent Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Performance dos Criativos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredCreatives.length}{' '}
            {filteredCreatives.length === 1 ? 'criativo em veiculação' : 'criativos em veiculação'}{' '}
            nas últimas 24h
          </p>
        </div>

        {/* Permanent active indicator badge (non-clickable) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-ocean-50 text-ocean-700 border border-ocean-200/80 shadow-sm self-start sm:self-auto">
          <Sparkles size={14} className="text-ocean-600" />
          <span>Investimento &gt; R$ 1,00 (Últimas 24h)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {error ? (
        <div className="card p-6 text-center text-red-500 text-sm">
          {error}
        </div>
      ) : !filteredCreatives || filteredCreatives.length === 0 ? (
        <div className="card p-8 text-center text-slate-500 text-sm">
          <p className="font-medium text-slate-700">
            Nenhum criativo com gasto superior a R$ 1,00 encontrado nas últimas 24 horas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 section-animate">
          {filteredCreatives.map((creative) => (
            <CreativeCard
              key={creative.id}
              row={creative}
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
