'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Award, FolderKanban, KeyRound, Megaphone } from 'lucide-react';
import {
  formatCurrency,
  formatInteger,
} from '@/lib/formatters';
import {
  groupByCampaign,
  groupByAdGroup,
  groupByKeyword,
} from '@/lib/metrics';

function SortIcon({ colKey, sortConfig }) {
  if (sortConfig.key !== colKey) {
    return <ChevronUp size={12} className="opacity-25 ml-1" />;
  }
  return sortConfig.dir === 'asc'
    ? <ChevronUp size={12} className="ml-1 text-ocean-500" />
    : <ChevronDown size={12} className="ml-1 text-ocean-500" />;
}

export default function CampaignTable({ campaignGroups, rows = [], loading, activePlatform = 'meta' }) {
  const [viewMode, setViewMode] = useState('campaigns'); // 'campaigns' | 'adGroups' | 'keywords'
  const [sortConfig, setSortConfig] = useState({ key: 'investimento', dir: 'desc' });

  const activeData = useMemo(() => {
    if (viewMode === 'adGroups') {
      return groupByAdGroup(rows.length > 0 ? rows : []);
    }
    if (viewMode === 'keywords') {
      return groupByKeyword(rows.length > 0 ? rows : []);
    }
    return campaignGroups && campaignGroups.length > 0 ? campaignGroups : groupByCampaign(rows);
  }, [viewMode, rows, campaignGroups]);

  const sorted = useMemo(() => {
    const groups = [...(activeData || [])];
    return groups.sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === 'string') {
        return sortConfig.dir === 'asc'
          ? (av || '').localeCompare(bv || '')
          : (bv || '').localeCompare(av || '');
      }
      return sortConfig.dir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
    });
  }, [activeData, sortConfig]);

  function handleSort(key) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
  }

  if (loading) {
    return (
      <div className="card p-6 section-animate">
        <div className="skeleton h-6 w-48 rounded-lg mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const isGoogleOrAll = activePlatform === 'google' || activePlatform === 'all' || rows.some(r => r.grupo_anuncios || r.palavra_chave);

  if (!sorted.length) {
    return (
      <div className="card p-6 section-animate text-slate-400 text-sm text-center py-12">
        Sem dados no período selecionado
      </div>
    );
  }

  // Pre-compute best values for highlighting
  const maxLeads = Math.max(...sorted.map((c) => c.leads || 0));
  const minCpl   = Math.min(...sorted.filter((c) => c.cpl > 0).map((c) => c.cpl));

  return (
    <div className="card overflow-hidden section-animate">
      {/* Table Header & View Toggles */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {viewMode === 'adGroups'
              ? 'Desempenho por Grupo de Anúncios'
              : viewMode === 'keywords'
              ? 'Desempenho por Palavra-Chave'
              : 'Desempenho por Campanha'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {sorted.length} {sorted.length === 1 ? 'item' : 'itens'} consolidados no período
          </p>
        </div>

        {/* View mode toggle tabs (for Google Ads & Combined view) */}
        {isGoogleOrAll && (
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('campaigns')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'campaigns'
                  ? 'bg-white text-ocean-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Megaphone size={13} />
              <span>Campanhas</span>
            </button>
            <button
              onClick={() => setViewMode('adGroups')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'adGroups'
                  ? 'bg-white text-emerald-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderKanban size={13} />
              <span>Grupos de Anúncios</span>
            </button>
            <button
              onClick={() => setViewMode('keywords')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'keywords'
                  ? 'bg-white text-purple-700 shadow font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound size={13} />
              <span>Palavras-Chave</span>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              {/* Dynamic Name Column */}
              <th onClick={() => handleSort(viewMode === 'keywords' ? 'palavra_chave' : viewMode === 'adGroups' ? 'grupo_anuncios' : 'campanha')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  {viewMode === 'keywords' ? 'Palavra-Chave' : viewMode === 'adGroups' ? 'Grupo de Anúncios' : 'Campanha'}
                  <SortIcon colKey={viewMode === 'keywords' ? 'palavra_chave' : viewMode === 'adGroups' ? 'grupo_anuncios' : 'campanha'} sortConfig={sortConfig} />
                </span>
              </th>

              {/* Sub-label column for AdGroups/Keywords */}
              {viewMode !== 'campaigns' && (
                <th>Campanha</th>
              )}

              <th onClick={() => handleSort('investimento')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Investimento
                  <SortIcon colKey="investimento" sortConfig={sortConfig} />
                </span>
              </th>

              <th onClick={() => handleSort('leads')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Leads
                  <SortIcon colKey="leads" sortConfig={sortConfig} />
                </span>
              </th>

              <th onClick={() => handleSort('cpl')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Custo / Lead
                  <SortIcon colKey="cpl" sortConfig={sortConfig} />
                </span>
              </th>

              <th onClick={() => handleSort('cliques')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Cliques
                  <SortIcon colKey="cliques" sortConfig={sortConfig} />
                </span>
              </th>

              <th onClick={() => handleSort('impressoes')} className="cursor-pointer select-none">
                <span className="inline-flex items-center">
                  Impressões
                  <SortIcon colKey="impressoes" sortConfig={sortConfig} />
                </span>
              </th>

              {isGoogleOrAll && (
                <th onClick={() => handleSort('valorConversao')} className="cursor-pointer select-none">
                  <span className="inline-flex items-center">
                    Valor Conversão
                    <SortIcon colKey="valorConversao" sortConfig={sortConfig} />
                  </span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => {
              const nameValue =
                viewMode === 'keywords'
                  ? row.palavra_chave
                  : viewMode === 'adGroups'
                  ? row.grupo_anuncios
                  : row.campanha;

              return (
                <tr key={`${nameValue}_${idx}`} className="group">
                  {/* Main Identifier Column */}
                  <td>
                    <div className="flex items-center gap-2">
                      {idx < 3 && viewMode === 'campaigns' && (
                        <Award
                          size={14}
                          className={
                            idx === 0
                              ? 'text-amber-500'
                              : idx === 1
                              ? 'text-slate-400'
                              : 'text-amber-700'
                          }
                        />
                      )}
                      <span className="font-semibold text-slate-800 leading-snug max-w-[220px] block truncate" title={nameValue}>
                        {nameValue}
                      </span>
                    </div>
                  </td>

                  {/* Sub Campaign Column for AdGroups & Keywords */}
                  {viewMode !== 'campaigns' && (
                    <td>
                      <span className="text-xs text-slate-500 max-w-[160px] block truncate" title={row.nome_campanha}>
                        {row.nome_campanha || '—'}
                      </span>
                    </td>
                  )}

                  <td className="font-medium text-slate-700">{formatCurrency(row.investimento)}</td>

                  {/* Leads — highlight best */}
                  <td>
                    <span
                      className={`font-bold ${
                        row.leads === maxLeads && row.leads > 0
                          ? 'text-emerald-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatInteger(row.leads)}
                    </span>
                  </td>

                  {/* CPL — highlight lowest */}
                  <td>
                    <span
                      className={`font-medium ${
                        row.cpl > 0 && row.cpl === minCpl
                          ? 'text-emerald-600 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {row.cpl > 0 ? formatCurrency(row.cpl) : '—'}
                    </span>
                  </td>

                  <td className="text-slate-700">{formatInteger(row.cliques)}</td>
                  <td className="text-slate-700">{formatInteger(row.impressoes)}</td>

                  {isGoogleOrAll && (
                    <td className="font-medium text-slate-800">
                      {row.valorConversao > 0 ? formatCurrency(row.valorConversao) : '—'}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
