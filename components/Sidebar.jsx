'use client';

import {
  LayoutDashboard,
  Megaphone,
  Image,
  BarChart3,
  FileText,
  ChevronRight,
  X,
  Anchor,
} from 'lucide-react';

const navItems = [
  { id: 'visao-geral',  label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'performance',  label: 'Performance', icon: BarChart3 },
  { id: 'campanhas',    label: 'Campanhas',   icon: Megaphone },
  { id: 'relatorios',   label: 'Relatórios',  icon: FileText },
  { id: 'criativos',    label: 'Criativos',   icon: Image },
];

export default function Sidebar({ activeSection, onSectionChange, isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`} role="navigation" aria-label="Menu principal">
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://oestemarine.com.br/wp-content/uploads/2026/02/imgi_24_logorodape-1.png"
                alt="Oeste Marine"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden items-center gap-2 text-white font-bold text-sm"
                aria-hidden="true"
              >
                <Anchor size={18} className="text-ocean-400" />
                <span>Oeste Marine</span>
              </div>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation list */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Navegação
          </span>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => {
                onSectionChange(id);
                onClose();
              }}
              className={`sidebar-nav-item ${activeSection === id ? 'active' : ''}`}
              aria-current={activeSection === id ? 'page' : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {activeSection === id && (
                <ChevronRight size={14} className="opacity-60" />
              )}
            </a>
          ))}
        </nav>

        {/* Footer info */}
        <div className="px-5 py-4 border-t border-white/10 mt-auto">
          <p className="text-xs text-slate-400 font-medium">Dashboard Meta Ads</p>
          <p className="text-xs text-slate-600 mt-0.5">Oeste Marine &copy; 2026</p>
        </div>
      </aside>
    </>
  );
}
