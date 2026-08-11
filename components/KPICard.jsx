'use client';

import { Info, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Reusable KPI card — supports large and small variants.
 *
 * Props:
 *   title       string     Metric label
 *   value       string     Formatted value string
 *   icon        Component  Lucide icon component
 *   iconColor   string     Tailwind class for icon color
 *   iconBg      string     Tailwind class for icon background
 *   secondary   string     Secondary info text (e.g. "vs. período anterior")
 *   trend       object     { direction: 'up'|'down'|'neutral', value: string }
 *   tooltip     string     Tooltip explanation
 *   variant     string     'large' | 'small'
 *   trendIsGood boolean    When false, an upward trend is shown in red (e.g. for CPL)
 */
export default function KPICard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-ocean-500',
  iconBg = 'bg-ocean-50',
  secondary,
  trend,
  tooltip,
  variant = 'large',
  trendIsGood = true,
}) {
  const isLarge = variant === 'large';

  // Determine trend color — for metrics where higher = worse (CPL, CPC), flip logic
  let trendClass = 'trend-neutral';
  if (trend) {
    const isPositiveDirection = trend.direction === 'up';
    const isGood = trendIsGood ? isPositiveDirection : !isPositiveDirection;
    trendClass = isGood ? 'trend-up' : 'trend-down';
  }

  return (
    <div
      className={`card group relative overflow-hidden transition-all duration-200
        ${isLarge ? 'p-6' : 'p-4'}`}
      style={{ animationDelay: '0ms' }}
    >
      {/* Subtle gradient accent top-right */}
      <div
        className="absolute top-0 right-0 w-20 h-20 opacity-5 rounded-bl-full"
        style={{ background: 'radial-gradient(circle, #1d6fd8 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Title + tooltip */}
          <div className="flex items-center gap-1.5 mb-2">
            <p
              className={`font-semibold text-slate-500 uppercase tracking-wide truncate
                ${isLarge ? 'text-xs' : 'text-xs'}`}
            >
              {title}
            </p>
            {tooltip && (
              <div className="tooltip-wrapper flex-shrink-0">
                <Info size={12} className="text-slate-400 cursor-help" />
                <div className="tooltip-box">{tooltip}</div>
              </div>
            )}
          </div>

          {/* Main value */}
          <p
            className={`font-bold text-slate-900 leading-none tabular-nums
              ${isLarge ? 'text-3xl' : 'text-xl'}`}
          >
            {value}
          </p>

          {/* Trend + secondary */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs font-semibold ${trendClass}`}>
                {trend.direction === 'up' ? (
                  <TrendingUp size={12} />
                ) : trend.direction === 'down' ? (
                  <TrendingDown size={12} />
                ) : null}
                {trend.value}
              </span>
            )}
            {secondary && (
              <span className="text-xs text-slate-400 font-medium">{secondary}</span>
            )}
          </div>
        </div>

        {/* Icon */}
        <div
          className={`flex-shrink-0 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110
            ${iconBg}
            ${isLarge ? 'w-12 h-12' : 'w-9 h-9'}`}
        >
          {Icon && (
            <Icon
              size={isLarge ? 22 : 17}
              className={iconColor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
