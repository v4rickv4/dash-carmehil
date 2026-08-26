'use client';

import {
  LayoutDashboard,
  Megaphone,
  Image,
  BarChart3,
  FileText,
  ChevronRight,
  X,
  Zap,
  Globe,
  Share2,
  Layers,
} from 'lucide-react';

const platforms = [
  { id: 'meta', label: 'Meta Ads', icon: Share2, badge: 'Facebook & IG', color: 'from-blue-600 to-indigo-600' },
  { id: 'google', label: 'Google Ads', icon: Globe, badge: 'Search & PMax', color: 'from-amber-500 to-emerald-600' },
  { id: 'all', label: 'Visão Consolidada', icon: Layers, badge: 'Todas', color: 'from-purple-600 to-blue-600' },
];

const navItems = [
  { id: 'visao-geral',  label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'performance',  label: 'Performance', icon: BarChart3 },
  { id: 'campanhas',    label: 'Campanhas',   icon: Megaphone },
  { id: 'relatorios',   label: 'Relatórios',  icon: FileText },
  { id: 'criativos',    label: 'Criativos',   icon: Image },
];

export default function Sidebar({
  activePlatform = 'meta',
  onPlatformChange,
  activeSection,
  onSectionChange,
  isOpen,
  onClose,
}) {
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
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://carmehil.com.br/wp-content/uploads/2023/05/logo-carmehil.png"
                alt="Carmehil"
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div
                className="hidden items-center gap-2 text-white font-extrabold text-base tracking-wide"
                aria-hidden="true"
              >
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-md">
                  <Zap size={16} fill="currentColor" />
                </div>
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  CARMEHIL
                </span>
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

        {/* Platform Selection Menus */}
        <div className="px-5 pt-5 pb-2">
          <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest">
            Plataformas de Anúncios
          </span>
        </div>

        <div className="px-3 space-y-1.5 mb-4">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isActive = activePlatform === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (onPlatformChange) onPlatformChange(p.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all border ${
                  isActive
                    ? 'bg-white/15 text-white border-white/25 shadow-lg shadow-black/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? `bg-gradient-to-br ${p.color} text-white` : 'bg-white/10 text-slate-400'}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 text-left">
                  <div className="leading-none text-white font-semibold">{p.label}</div>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                }`}>
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation list */}
        <div className="px-5 pt-3 pb-2 border-t border-white/10">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Navegação do Painel
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
          <p className="text-xs text-slate-400 font-medium">Dashboard Multi-Plataforma</p>
          <p className="text-xs text-slate-600 mt-0.5">Carmehil Network &copy; 2026</p>
        </div>
      </aside>
    </>
  );
}
