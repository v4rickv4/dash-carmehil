'use client';

import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { buildTimeSeriesData } from '@/lib/metrics';
import { formatCurrency, formatInteger, formatDateShort } from '@/lib/formatters';

const METRICS = [
  { key: 'investimento', label: 'Investimento',         format: formatCurrency, color: '#1d6fd8' },
  { key: 'leads',        label: 'Leads / Conversões',  format: formatInteger,  color: '#16a34a' },
  { key: 'cliques',      label: 'Cliques',              format: formatInteger,  color: '#7c3aed' },
  { key: 'impressoes',   label: 'Impressões',           format: formatInteger,  color: '#0ea5e9' },
  { key: 'alcance',      label: 'Alcance',              format: formatInteger,  color: '#f59e0b' },
];

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-navy-900 text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-sm">
      <p className="text-blue-300 font-medium mb-1">{label}</p>
      <p className="font-bold text-lg">{formatter(payload[0]?.value ?? 0)}</p>
    </div>
  );
}

export default function PerformanceChart({ rows, loading }) {
  const [activeMetric, setActiveMetric] = useState('investimento');

  const metric = METRICS.find((m) => m.key === activeMetric) ?? METRICS[0];

  const chartData = useMemo(() => {
    const series = buildTimeSeriesData(rows, activeMetric);
    // Format date labels
    return series.map((d) => ({
      ...d,
      label: formatDateShort(d.date),
    }));
  }, [rows, activeMetric]);

  if (loading) {
    return <div className="skeleton h-[340px] rounded-2xl" />;
  }

  const gradientId = `gradient-${activeMetric}`;

  return (
    <div className="card p-4 sm:p-6 section-animate">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Evolução de Performance</h2>
          <p className="text-sm text-slate-500 mt-0.5">Resultado ao longo do período selecionado</p>
        </div>

        {/* Metric tabs */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 flex-wrap">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap
                ${activeMetric === m.key
                  ? 'bg-white text-ocean-600 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {chartData.length === 0 ? (
        <div className="h-[240px] flex items-center justify-center text-slate-400 text-sm">
          Sem dados no período selecionado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metric.color} stopOpacity={0.2} />
                <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Inter' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => {
                if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
                if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
                return String(v);
              }}
              width={48}
            />

            <Tooltip
              content={<CustomTooltip formatter={metric.format} />}
              cursor={{ stroke: metric.color, strokeWidth: 1, strokeDasharray: '4 4' }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={metric.color}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: metric.color, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
