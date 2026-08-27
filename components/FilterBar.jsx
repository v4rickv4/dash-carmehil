'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, ChevronDown, Building2, FolderKanban, KeyRound } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'investimento', label: 'Maior investimento' },
  { value: 'leads',        label: 'Mais leads' },
  { value: 'cpl',          label: 'Menor CPL' },
  { value: 'cliques',      label: 'Mais cliques' },
];

export default function FilterBar({
  filters,
  onFiltersChange,
  campaigns = [],
  accounts = [],
  adGroups = [],
  keywords = [],
  activePlatform = 'meta',
}) {
  const [expanded, setExpanded] = useState(false);

  function update(key, value) {
    onFiltersChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onFiltersChange({
      startDate: '',
      endDate: '',
      campaign: '',
      accountId: '',
      adGroup: '',
      keyword: '',
      sortBy: 'investimento',
    });
  }

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.campaign ||
    filters.accountId ||
    filters.adGroup ||
    filters.keyword;

  const isGoogleOrAll = activePlatform === 'google' || activePlatform === 'all';
  const showAccountFilter = accounts.length > 0 || isGoogleOrAll;

  return (
    <div className="bg-white border-b border-slate-200">
      {/* Filter bar top row */}
      <div className="px-4 sm:px-6 py-3 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-ocean-600 hover:bg-ocean-50 transition-colors border border-slate-200 hover:border-ocean-200"
        >
          <SlidersHorizontal size={15} />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-ocean-500 flex-shrink-0" />
          )}
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Account Selector (Google Ads / Multi-Conta) */}
        {showAccountFilter && (
          <div className="flex items-center gap-2 max-w-full">
            <div className="flex items-center gap-1 text-slate-500">
              <Building2 size={14} className="text-amber-500" />
              <label className="text-xs font-semibold whitespace-nowrap">Conta:</label>
            </div>
            <select
              value={filters.accountId || ''}
              onChange={(e) => update('accountId', e.target.value)}
              className="filter-select text-sm px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/40 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all font-medium max-w-[200px] truncate"
            >
              <option value="">Todas as Contas</option>
              {accounts.map((acc) => (
                <option key={acc.conta_id} value={acc.conta_id}>
                  {acc.conta_id} ({acc.conta_nome || 'Carmehil'})
                </option>
              ))}
              {accounts.length === 0 && (
                <option value="849-204-1182">849-204-1182 (Google Ads Carmehil)</option>
              )}
            </select>
          </div>
        )}

        {/* Date range - always visible */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">De:</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => update('startDate', e.target.value)}
              className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Até:</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => update('endDate', e.target.value)}
              className="text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Campaign selector */}
        <div className="flex items-center gap-2 max-w-full">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Campanha:</label>
          <select
            value={filters.campaign || ''}
            onChange={(e) => update('campaign', e.target.value)}
            className="filter-select text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all min-w-[170px] max-w-[240px] truncate"
          >
            <option value="">Todas as campanhas</option>
            {campaigns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Google Ads Ad Group Filter */}
        {isGoogleOrAll && adGroups.length > 0 && (
          <div className="flex items-center gap-2 max-w-full">
            <div className="flex items-center gap-1 text-slate-500">
              <FolderKanban size={14} className="text-emerald-600" />
              <label className="text-xs font-semibold whitespace-nowrap">Grupo:</label>
            </div>
            <select
              value={filters.adGroup || ''}
              onChange={(e) => update('adGroup', e.target.value)}
              className="filter-select text-sm px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all min-w-[150px] max-w-[200px] truncate"
            >
              <option value="">Todos os Grupos</option>
              {adGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        )}

        {/* Google Ads Keyword Filter */}
        {isGoogleOrAll && keywords.length > 0 && (
          <div className="flex items-center gap-2 max-w-full">
            <div className="flex items-center gap-1 text-slate-500">
              <KeyRound size={14} className="text-purple-600" />
              <label className="text-xs font-semibold whitespace-nowrap">Palavra-chave:</label>
            </div>
            <select
              value={filters.keyword || ''}
              onChange={(e) => update('keyword', e.target.value)}
              className="filter-select text-sm px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50/30 text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all min-w-[150px] max-w-[200px] truncate"
            >
              <option value="">Todas as Palavras</option>
              {keywords.map((kw) => (
                <option key={kw} value={kw}>{kw}</option>
              ))}
            </select>
          </div>
        )}

        {/* Sort */}
        {expanded && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">Ordenar por:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => update('sortBy', e.target.value)}
              className="filter-select text-sm px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-ocean-400 focus:border-transparent transition-all"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors border border-red-100 hover:border-red-200 ml-auto"
          >
            <X size={13} />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
}
