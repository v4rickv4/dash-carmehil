'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { buildDistributionData } from '@/lib/metrics';
import { formatCurrency, formatPercent } from '@/lib/formatters';

const COLORS = [
  '#1d6fd8', '#0ea5e9', '#7c3aed', '#16a34a',
  '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6',
  '#10b981', '#f97316',
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-sm max-w-[220px]">
      <p className="text-blue-300 font-medium mb-1 leading-snug">{d.name}</p>
      <p className="font-bold">{formatCurrency(d.value)}</p>
      <p className="text-slate-400 text-xs mt-0.5">{formatPercent(d.percent)} do total</p>
    </div>
  );
}

export default function CampaignDistribution({ campaignGroups, totalInvestimento, loading }) {
  const data = useMemo(
    () => buildDistributionData(campaignGroups, totalInvestimento),
    [campaignGroups, totalInvestimento]
  );

  if (loading) {
    return <div className="skeleton h-[360px] rounded-2xl" />;
  }

  if (!data.length) {
    return (
      <div className="card p-6 section-animate h-[360px] flex items-center justify-center text-slate-400 text-sm">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="card p-6 section-animate">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Distribuição por Campanha</h2>
        <p className="text-sm text-slate-500 mt-0.5">Participação de cada campanha no investimento total</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut */}
        <div className="w-full lg:w-[200px] flex-shrink-0" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="flex-1 space-y-2 w-full">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3 group">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-sm text-slate-700 font-medium truncate group-hover:text-ocean-600 transition-colors"
                    title={item.name}
                  >
                    {item.name}
                  </span>
                  <span className="text-sm font-bold text-slate-900 whitespace-nowrap">
                    {formatPercent(item.percent)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(item.percent, 100)}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(item.value)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
