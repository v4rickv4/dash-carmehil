'use client';

import { useState } from 'react';
import { ImageOff, ExternalLink, Users, Pointer, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatInteger, formatDate } from '@/lib/formatters';
import { safeNum } from '@/lib/metrics';

export default function CreativeCard({ row, onOpenDrawer }) {
  const [imgError, setImgError] = useState(false);

  const campanha     = row.nome_campanha || 'Sem campanha';
  const investimento = safeNum(row.investimento);
  const leads        = safeNum(row.leads) + safeNum(row.mensagens);
  const cliques      = safeNum(row.cliques);
  const cpl          = leads > 0 ? investimento / leads : 0;

  const hasThumbnail = row.url_imagem && !imgError;

  return (
    <div
      className="creative-card group cursor-pointer"
      onClick={() => onOpenDrawer(row)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDrawer(row)}
      aria-label={`Ver detalhes do criativo da campanha ${campanha}`}
    >
      {/* Image area */}
      <div className="card-image-wrapper">
        {hasThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.url_imagem}
            alt={`Criativo — ${campanha}`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200">
            <ImageOff size={28} className="text-slate-400" />
            <p className="text-xs text-slate-400 font-medium">Criativo indisponível</p>
          </div>
        )}

        {/* Campaign badge overlay */}
        <div className="absolute top-2 left-2">
          <span className="metric-chip metric-chip-blue max-w-[140px] truncate" title={campanha}>
            {campanha}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Date */}
        <p className="text-xs text-slate-400 font-medium mb-3">{formatDate(row.data)}</p>

        {/* Metric chips */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Users size={10} />
              Conversões
            </span>
            <span className="text-sm font-bold text-emerald-600">{formatInteger(leads)}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Target size={10} />
              CPL
            </span>
            <span className="text-sm font-bold text-slate-800">
              {cpl > 0 ? formatCurrency(cpl) : '—'}
            </span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Pointer size={10} />
              Cliques
            </span>
            <span className="text-sm font-bold text-ocean-600">{formatInteger(cliques)}</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 flex flex-col gap-0.5">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <DollarSign size={10} />
              Invest.
            </span>
            <span className="text-sm font-bold text-slate-800">{formatCurrency(investimento)}</span>
          </div>
        </div>

        {/* CTA */}
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-ocean-50 hover:bg-ocean-100 text-ocean-600 font-semibold text-xs transition-colors border border-ocean-100 hover:border-ocean-200"
          tabIndex={-1}
        >
          <ExternalLink size={12} />
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
