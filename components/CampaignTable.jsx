'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Award } from 'lucide-react';
import {
  formatCurrency,
  formatInteger,
} from '@/lib/formatters';

const COLUMNS = [
  { key: 'campanha',     label: 'Campanha',     sortable: false, format: (v) => v },
  { key: 'investimento', label: 'Investimento', sortable: true,  format: formatCurrency },
  { key: 'leads',        label: 'Conversões',   sortable: true,  format: formatInteger },
  { key: 'cpl',          label: 'CPL',          sortable: true,  format: (v) => v > 0 ? formatCurrency(v) : '—' },
  { key: 'cliques',      label: 'Cliques',      sortable: true,  format: formatInteger },
  { key: 'alcance',      label: 'Alcance',      sortable: true,  format: formatInteger },
  { key: 'impressoes',   label: 'Impressões',   sortable: true,  format: formatInteger },
];

function SortIcon({ colKey, sortConfig }) {
  if (sortConfig.key !== colKey) {
    return <ChevronUp size={12} className="opacity-25 ml-1" />;
  }
  return sortConfig.dir === 'asc'
    ? <ChevronUp size={12} className="ml-1 text-ocean-500" />
    : <ChevronDown size={12} className="ml-1 text-ocean-500" />;
}

export default function CampaignTable({ campaignGroups, loading }) {
  const [sortConfig, setSortConfig] = useState({ key: 'investimento', dir: 'desc' });

  const sorted = useMemo(() => {
    const groups = [...(campaignGroups || [])];
    return groups.sort((a, b) => {
      const av = a[sortConfig.key];
      const bv = b[sortConfig.key];
      if (typeof av === 'string') {
        return sortConfig.dir === 'asc'
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      }
      return sortConfig.dir === 'asc' ? av - bv : bv - av;
    });
  }, [campaignGroups, sortConfig]);

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

  if (!sorted.length) {
    return (
      <div className="card p-6 section-animate text-slate-400 text-sm text-center py-12">
        Sem dados de campanhas no período selecionado
      </div>
    );
  }

  // Pre-compute best values for highlighting
  const maxLeads = Math.max(...sorted.map((c) => c.leads));
  const minCpl   = Math.min(...sorted.filter((c) => c.cpl > 0).map((c) => c.cpl));

  return (
    <div className="card overflow-hidden section-animate">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900">Performance por Campanha</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          {sorted.length} {sorted.length === 1 ? 'campanha' : 'campanhas'} no período
        </p>
      </div>

      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto">
        <table className="premium-table">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  className={col.sortable ? 'cursor-pointer select-none' : ''}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && <SortIcon colKey={col.key} sortConfig={sortConfig} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, idx) => (
              <tr key={row.campanha} className="group">
                {/* Campanha name — with rank badge for top 3 */}
                <td>
                  <div className="flex items-center gap-2">
                    {idx < 3 && (
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
                    <span className="font-semibold text-slate-800 leading-snug max-w-[200px] block truncate" title={row.campanha}>
                      {row.campanha}
                    </span>
                  </div>
                </td>

                <td className="font-medium text-slate-700">{formatCurrency(row.investimento)}</td>

                {/* Leads / Conversões — highlight best */}
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
                <td className="text-slate-700">{formatInteger(row.alcance)}</td>
                <td className="text-slate-700">{formatInteger(row.impressoes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
