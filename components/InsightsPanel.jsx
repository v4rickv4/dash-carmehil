'use client';

import { useMemo } from 'react';
import { Users, TrendingDown, MousePointerClick, PieChart, Zap } from 'lucide-react';
import { computeInsights } from '@/lib/metrics';

const ICON_MAP = {
  Users,
  TrendingDown,
  MousePointerClick,
  PieChart,
  Zap,
};

const TYPE_STYLES = {
  positive: {
    bg:     'bg-emerald-50',
    border: 'border-emerald-100',
    icon:   'text-emerald-600',
    badge:  'bg-emerald-100 text-emerald-700',
  },
  info: {
    bg:     'bg-ocean-50',
    border: 'border-ocean-100',
    icon:   'text-ocean-600',
    badge:  'bg-ocean-100 text-ocean-700',
  },
  warning: {
    bg:     'bg-amber-50',
    border: 'border-amber-100',
    icon:   'text-amber-600',
    badge:  'bg-amber-100 text-amber-700',
  },
};

export default function InsightsPanel({ campaignGroups, totals, loading }) {
  const insights = useMemo(
    () => computeInsights(campaignGroups || [], totals || {}),
    [campaignGroups, totals]
  );

  if (loading) {
    return (
      <div className="section-animate">
        <div className="skeleton h-6 w-48 rounded-lg mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-[96px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!insights.length) return null;

  return (
    <div className="section-animate">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900">Insights de Performance</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Análise automática baseada nos dados do período
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const style = TYPE_STYLES[insight.type] ?? TYPE_STYLES.info;
          const IconComp = ICON_MAP[insight.icon] ?? Zap;

          return (
            <div
              key={insight.id}
              className={`rounded-2xl border p-4 flex gap-3 items-start transition-all duration-200 hover:-translate-y-0.5 ${style.bg} ${style.border}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.badge}`}
              >
                <IconComp size={17} />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${style.icon}`}>
                  {insight.title}
                </p>
                <p className="text-sm text-slate-700 leading-snug">{insight.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
