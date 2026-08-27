'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, KeyRound, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatInteger, formatPercent } from '@/lib/formatters';
import { safeNum } from '@/lib/metrics';

function SortIcon({ colKey, sortConfig }) {
  if (sortConfig.key !== colKey) {
    return <ChevronUp size={12} className="opacity-25 ml-1 inline-block" />;
  }
  return sortConfig.dir === 'asc' ? (
    <ChevronUp size={12} className="ml-1 text-ocean-500 inline-block" />
  ) : (
    <ChevronDown size={12} className="ml-1 text-ocean-500 inline-block" />
  );
}

export default function KeywordsTable({ rows = [], loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'investimento', dir: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 1. Filter records where palavra_chave is valid (not '--', not '-', not null/empty)
  const validRows = useMemo(() => {
    return rows.filter((r) => {
      const kw = r.palavra_chave;
      if (!kw) return false;
      const trimmed = String(kw).trim();
      return trimmed !== '' && trimmed !== '--' && trimmed !== '-';
    });
  }, [rows]);

  // 2. Aggregate or process row metrics
  const processedRows = useMemo(() => {
    return validRows.map((r) => {
      const kw = r.palavra_chave || '-';
      const cmp = r.campanha || r.nome_campanha || 'Sem campanha';
      const grp = r.grupo_anuncios || 'Geral';
      const inv = safeNum(r.investimento);
      const imp = safeNum(r.impressoes);
      const clk = safeNum(r.cliques);
      const lds = safeNum(r.leads);

      // CTR (%)
      const ctrVal = r.ctr !== undefined && r.ctr !== null
        ? safeNum(r.ctr)
        : imp > 0 ? (clk / imp) * 100 : 0;

      // CPC Médio (investimento / cliques)
      const cpcVal = clk > 0 ? inv / clk : 0;

      // Custo por Conversão (custo_por_lead or investimento / leads)
      const cplVal = r.custo_por_lead !== undefined && safeNum(r.custo_por_lead) > 0
        ? safeNum(r.custo_por_lead)
        : lds > 0 ? inv / lds : 0;

      return {
        id: r.id || `${kw}-${cmp}-${grp}`,
        palavra_chave: kw,
        campanha: cmp,
        grupo_anuncios: grp,
        investimento: inv,
        impressoes: imp,
        cliques: clk,
        ctr: ctrVal,
        cpc: cpcVal,
        leads: lds,
        custo_por_lead: cplVal,
      };
    });
  }, [validRows]);

  // 3. Search filter
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return processedRows;
    const term = searchTerm.toLowerCase();
    return processedRows.filter(
      (r) =>
        r.palavra_chave.toLowerCase().includes(term) ||
        r.campanha.toLowerCase().includes(term) ||
        r.grupo_anuncios.toLowerCase().includes(term)
    );
  }, [processedRows, searchTerm]);

  // 4. Sorting
  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    list.sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === 'string') {
        return sortConfig.dir === 'asc'
          ? (av || '').localeCompare(bv || '')
          : (bv || '').localeCompare(av || '');
      }
      return sortConfig.dir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
    });
    return list;
  }, [filteredRows, sortConfig]);

  // 5. Pagination
  const totalItems = sortedRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const pageIndex = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, pageIndex, pageSize]);

  function handleSort(key) {
    setSortConfig((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
  }

  function handleSearch(e) {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="card p-6 section-animate">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-48 rounded-lg" />
          <div className="skeleton h-9 w-64 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden section-animate">
      {/* Header & Controls */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <KeyRound size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Desempenho por Palavra-chave (Google Ads)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exibindo {totalItems} {totalItems === 1 ? 'palavra-chave' : 'palavras-chave'} encontradas
          </p>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar palavra, campanha..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 w-56 sm:w-64 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      {!totalItems ? (
        <div className="p-12 text-center text-slate-400 text-sm">
          Nenhuma palavra-chave encontrada para os filtros selecionados.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th
                    onClick={() => handleSort('palavra_chave')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Palavra-chave <SortIcon colKey="palavra_chave" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('campanha')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Campanha <SortIcon colKey="campanha" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('grupo_anuncios')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Grupo de Anúncios <SortIcon colKey="grupo_anuncios" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('investimento')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Investimento <SortIcon colKey="investimento" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('impressoes')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Impressões <SortIcon colKey="impressoes" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('cliques')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Cliques <SortIcon colKey="cliques" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('ctr')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    CTR <SortIcon colKey="ctr" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('cpc')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    CPC Médio <SortIcon colKey="cpc" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('leads')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Conversões <SortIcon colKey="leads" sortConfig={sortConfig} />
                  </th>
                  <th
                    onClick={() => handleSort('custo_por_lead')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100/80 transition-colors"
                  >
                    Custo/Conv. <SortIcon colKey="custo_por_lead" sortConfig={sortConfig} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedRows.map((r, idx) => (
                  <tr
                    key={r.id || idx}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-800 flex items-center gap-2 max-w-[200px] truncate" title={r.palavra_chave}>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-mono border border-amber-200/50 truncate">
                        {r.palavra_chave}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={r.campanha}>
                      {r.campanha}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-[160px] truncate" title={r.grupo_anuncios}>
                      {r.grupo_anuncios}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">
                      {formatCurrency(r.investimento)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatInteger(r.impressoes)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 font-medium">
                      {formatInteger(r.cliques)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {formatPercent(r.ctr)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">
                      {r.cpc > 0 ? formatCurrency(r.cpc) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600">
                      {formatInteger(r.leads)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {r.custo_por_lead > 0 ? formatCurrency(r.custo_por_lead) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Itens por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ocean-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-2">
                Mostrando {(pageIndex - 1) * pageSize + 1} - {Math.min(pageIndex * pageSize, totalItems)} de {totalItems}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pageIndex === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-xs font-semibold text-slate-700">
                Página {pageIndex} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={pageIndex >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
