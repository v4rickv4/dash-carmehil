'use client';

import { useState, useEffect } from 'react';
import { X, ImageOff } from 'lucide-react';
import { formatCurrency, formatInteger, formatDate } from '@/lib/formatters';
import { safeNum } from '@/lib/metrics';

function MetricMini({ label, value, accent }) {
  return (
    <div className={`rounded-xl p-3 border ${accent ? 'bg-ocean-50 border-ocean-100' : 'bg-slate-50 border-slate-100'}`}>
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className={`text-sm font-bold ${accent ? 'text-ocean-700' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

export default function CreativeDrawer({ row, onClose }) {
  const [imgError, setImgError] = useState(false);

  // Close on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const investimento   = safeNum(row.investimento);
  const impressoes     = safeNum(row.impressoes);
  const alcance        = safeNum(row.alcance);
  const cliques        = safeNum(row.cliques);
  const leadsNativos   = safeNum(row.leads);
  const mensagens      = safeNum(row.mensagens);
  const totalConversoes = leadsNativos + mensagens;
  const cpl            = totalConversoes > 0 ? investimento / totalConversoes : 0;

  const campanha = row.nome_campanha || 'Sem campanha';
  const hasThumbnail = row.url_imagem && !imgError;

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className="drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Detalhes do criativo"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Detalhes do Criativo</h2>
            <p className="text-xs text-slate-500 mt-0.5">{campanha}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 aspect-video">
            {hasThumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.url_imagem}
                alt={`Criativo — ${campanha}`}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
                <ImageOff size={36} className="text-slate-400" />
                <p className="text-sm text-slate-400 font-medium">Criativo indisponível</p>
              </div>
            )}
          </div>

          {/* Info block */}
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Campanha</span>
              <span className="text-sm font-semibold text-slate-800 text-right max-w-[240px]">{campanha}</span>
            </div>
            {row.id_campanha && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">ID Campanha</span>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{row.id_campanha}</span>
              </div>
            )}
            {row.nome_anuncio && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Anúncio</span>
                <span className="text-sm font-semibold text-slate-800 text-right max-w-[220px] truncate">{row.nome_anuncio}</span>
              </div>
            )}
            {row.status && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-500 font-medium">Status</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  String(row.status).toUpperCase() === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {String(row.status).toUpperCase()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-500 font-medium">Data</span>
              <span className="text-sm font-semibold text-slate-800">{formatDate(row.data)}</span>
            </div>
          </div>

          {/* Primary metrics */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Métricas Principais
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricMini label="Investimento"  value={formatCurrency(investimento)} />
              <MetricMini label="Conversões (Total)" value={formatInteger(totalConversoes)} accent />
              <MetricMini label="CPL Unificado"  value={cpl > 0 ? formatCurrency(cpl) : '—'} accent />
              <MetricMini label="Cliques"        value={formatInteger(cliques)} />
            </div>
          </div>

          {/* Secondary metrics */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Métricas Detalhadas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <MetricMini label="Impressões"     value={formatInteger(impressoes)} />
              <MetricMini label="Alcance"        value={formatInteger(alcance)} />
              <MetricMini label="Formulários"    value={formatInteger(leadsNativos)} />
              <MetricMini label="Mensagens"      value={formatInteger(mensagens)} />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
