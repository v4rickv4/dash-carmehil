'use client';

import { useState } from 'react';
import { ImageOff, ExternalLink, Users, Pointer, DollarSign, Target } from 'lucide-react';
import { formatCurrency, formatInteger, formatDate } from '@/lib/formatters';
import { safeNum } from '@/lib/metrics';

export default function CreativeCard({ row, onOpenDrawer }) {
  const [imgError, setImgError] = useState(false);

  const anuncio      = row.nome_anuncio || row.nome_campanha || 'Criativo Meta Ads';
  const campanha     = row.nome_campanha || 'Sem campanha';
  const investimento = safeNum(row.investimento);
  const leads        = safeNum(row.leads);
  const cliques      = safeNum(row.cliques);
  const cpl          = row.cpl || (leads > 0 ? investimento / leads : 0);

  const hasThumbnail = row.url_imagem && !imgError;

  return (
    <div
      className="creative-card group cursor-pointer flex flex-col justify-between"
      onClick={() => onOpenDrawer(row)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenDrawer(row)}
      aria-label={`Ver detalhes do criativo ${anuncio}`}
    >
      <div>
        {/* Image area with Meta CDN anti-blocking attributes & ratio container */}
        <div className="card-image-wrapper relative overflow-hidden bg-slate-900 aspect-square">
          {hasThumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.url_imagem}
              alt={`Criativo — ${anuncio}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            /* Fallback visual elegante com título do anúncio para URLs expiradas do Meta CDN */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-200">
              <div className="p-3 rounded-full bg-white/10 mb-2 border border-white/10">
                <ImageOff size={24} className="text-amber-400" />
              </div>
              <p className="text-xs font-bold text-white line-clamp-2 leading-tight max-w-[90%]" title={anuncio}>
                {anuncio}
              </p>
              <span className="text-[10px] font-semibold text-slate-400 mt-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                Preview indisponível
              </span>
            </div>
          )}

          {/* Campaign badge overlay */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2 z-10">
            <span className="metric-chip metric-chip-blue max-w-full truncate backdrop-blur-md bg-slate-900/80 text-white border-white/20" title={campanha}>
              {campanha}
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 space-y-3">
          {/* Ad Name & Date */}
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 min-h-[2.5rem]" title={anuncio}>
              {anuncio}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">{formatDate(row.data)}</p>
          </div>

          {/* Metric chips */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Users size={10} />
                Conversões
              </span>
              <span className="text-sm font-bold text-emerald-600">{formatInteger(leads)}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Target size={10} />
                CPL
              </span>
              <span className="text-sm font-bold text-slate-800">
                {cpl > 0 ? formatCurrency(cpl) : '—'}
              </span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Pointer size={10} />
                Cliques
              </span>
              <span className="text-sm font-bold text-ocean-600">{formatInteger(cliques)}</span>
            </div>
            <div className="bg-slate-50 rounded-lg p-2 flex flex-col gap-0.5">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <DollarSign size={10} />
                Invest.
              </span>
              <span className="text-sm font-bold text-slate-800">{formatCurrency(investimento)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 pt-0">
        <button
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-ocean-50 hover:bg-ocean-100 text-ocean-600 font-semibold text-xs transition-colors border border-ocean-100 hover:border-ocean-200"
          tabIndex={-1}
        >
          <ExternalLink size={12} />
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
