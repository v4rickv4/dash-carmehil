'use client';

import { useState } from 'react';
import { RefreshCw, ChevronDown, Menu, Calendar } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'today',      label: 'Hoje' },
  { value: '7d',         label: 'Últimos 7 dias' },
  { value: '30d',        label: 'Últimos 30 dias' },
  { value: 'this-month', label: 'Este mês' },
  { value: 'last-month', label: 'Mês anterior' },
  { value: 'custom',     label: 'Personalizado' },
];

export default function Header({ period, onPeriodChange, onRefresh, isRefreshing, onMenuToggle }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedLabel =
    PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? 'Últimos 30 dias';

  function handlePeriodSelect(value) {
    onPeriodChange(value);
    setDropdownOpen(false);
  }

  return (
    <header
      className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between gap-4 border-b border-slate-200/80"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #112a50 55%, #1a3a6b 100%)',
      }}
    >
      {/* Left — hamburger + title */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-white font-bold text-xl leading-tight truncate">
            Dashboard de Performance
          </h1>
          <p className="text-blue-300/80 text-sm font-medium mt-0.5">
            Meta Ads&nbsp;•&nbsp;Oeste Marine
          </p>
        </div>
      </div>

      {/* Right — period selector + refresh */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Period selector */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all border border-white/15 hover:border-white/25"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
          >
            <Calendar size={15} className="text-blue-300" />
            <span>{selectedLabel}</span>
            <ChevronDown
              size={14}
              className={`text-blue-300 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <>
              {/* Click-away overlay */}
              <div
                className="fixed inset-0 z-50"
                onClick={() => setDropdownOpen(false)}
                aria-hidden="true"
              />
              <div
                className="absolute right-0 mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden"
                role="listbox"
                aria-label="Selecionar período"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    role="option"
                    aria-selected={period === opt.value}
                    onClick={() => handlePeriodSelect(opt.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${period === opt.value
                        ? 'bg-ocean-50 text-ocean-600 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ocean-500 hover:bg-ocean-400 text-white text-sm font-semibold transition-all shadow-lg shadow-ocean-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
          aria-label="Atualizar dados"
        >
          <RefreshCw
            size={15}
            className={`${isRefreshing ? 'animate-spin' : ''} transition-transform`}
          />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </div>
    </header>
  );
}
