'use client';

import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { buildInvestimentoLeadsTimeSeries } from '@/lib/metrics';
import { formatCurrency, formatInteger, formatDateShort } from '@/lib/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const inv  = payload.find((p) => p.dataKey === 'investimento');
  const leads = payload.find((p) => p.dataKey === 'leads');
  return (
    <div className="bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-sm min-w-[160px]">
      <p className="text-blue-300 font-medium mb-2">{label}</p>
      {inv && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-ocean-400 inline-block" />
            Investimento
          </span>
          <span className="font-bold">{formatCurrency(inv.value)}</span>
        </div>
      )}
      {leads && (
        <div className="flex items-center justify-between gap-4 mt-1">
          <span className="text-slate-300 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Conversões
          </span>
          <span className="font-bold">{formatInteger(leads.value)}</span>
        </div>
      )}
    </div>
  );
}

function CustomLegend() {
  return (
    <div className="flex items-center justify-end gap-5 mt-2">
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="w-3 h-3 rounded-sm bg-ocean-400 inline-block" />
        Investimento (R$)
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" />
        Leads / Conversões
      </div>
    </div>
  );
}

export default function InvestmentLeadsChart({ rows, loading }) {
  const chartData = useMemo(() => {
    const series = buildInvestimentoLeadsTimeSeries(rows);
    return series.map((d) => ({ ...d, label: formatDateShort(d.date) }));
  }, [rows]);

  if (loading) {
    return <div className="skeleton h-[320px] rounded-2xl" />;
  }

  return (
    <div className="card p-4 sm:p-6 section-animate">
      <div className="mb-5">
        <h2 className="text-base font-bold text-slate-900">Investimento × Conversões</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Relação entre valor investido e conversões geradas (Leads + Mensagens) ao longo do tempo
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
          Sem dados no período selecionado
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={230}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              {/* Left axis — investimento */}
              <YAxis
                yAxisId="inv"
                orientation="left"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                  return String(v);
                }}
                width={42}
              />
              {/* Right axis — leads */}
              <YAxis
                yAxisId="leads"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(29,111,216,0.04)' }} />

              <Bar
                yAxisId="inv"
                dataKey="investimento"
                fill="#1d6fd8"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
                maxBarSize={40}
                animationDuration={1000}
              />
              <Line
                yAxisId="leads"
                type="monotone"
                dataKey="leads"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1200}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <CustomLegend />
        </>
      )}
    </div>
  );
}
