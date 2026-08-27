'use client';

import logoImg from '@/images/logo.png';
import {
  LayoutDashboard,
  Megaphone,
  Image as ImageIcon,
  BarChart3,
  FileText,
  KeyRound,
  ChevronRight,
  X,
  Globe,
  Share2,
  Layers,
} from 'lucide-react';

export const platforms = [
  { id: 'meta', label: 'Meta Ads', icon: Share2, badge: 'Facebook & IG', color: 'from-blue-600 to-indigo-600' },
  { id: 'google', label: 'Google Ads', icon: Globe, badge: 'Search & PMax', color: 'from-amber-500 to-emerald-600' },
  { id: 'all', label: 'Visão Consolidada', icon: Layers, badge: 'Todas', color: 'from-purple-600 to-blue-600' },
];

export const NAV_ITEMS = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard, href: '#visao-geral', platforms: ['meta', 'google', 'consolidated'] },
  { id: 'performance', label: 'Performance', icon: BarChart3, href: '#performance', platforms: ['meta', 'google', 'consolidated'] },
  { id: 'campaigns', label: 'Campanhas', icon: Megaphone, href: '#campanhas', platforms: ['meta', 'google', 'consolidated'] },
  { id: 'keywords', label: 'Palavras-chave', icon: KeyRound, href: '#palavras-chave', platforms: ['google', 'consolidated'] },
  { id: 'creatives', label: 'Criativos', icon: ImageIcon, href: '#criativos', platforms: ['meta', 'consolidated'] },
  { id: 'reports', label: 'Relatórios', icon: FileText, href: '#relatorios', platforms: ['meta', 'google', 'consolidated'] },
];

export default function Sidebar({
  clientLogoUrl,
  activePlatform = 'meta',
  onPlatformChange,
  activeSection = 'visao-geral',
  onSectionChange,
  isOpen,
  onClose,
  navItems = NAV_ITEMS,
}) {
  const logoSrc = clientLogoUrl || process.env.NEXT_PUBLIC_CLIENT_LOGO_URL || logoImg?.src || logoImg || '/images/logo.png';
  const platformKey = activePlatform === 'all' ? 'consolidated' : activePlatform;

  const visibleNavItems = navItems.filter((item) =>
    item.platforms.includes(platformKey)
  );

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
        {/* Header de Logo por Imagem Dinâmica */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-slate-800/60">
          <div className="flex-1 flex items-center justify-center min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={typeof logoSrc === 'string' ? logoSrc : logoSrc?.src}
              alt="Logo"
              className="h-10 w-auto max-w-full object-contain"
              onError={(e) => {
                // Fallback discreto caso ocorra erro no carregamento
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0 ml-2"
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
                  if (onClose) onClose();
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

        <nav className="flex-1 px-3 space-y-1 pb-6">
          {visibleNavItems.map(({ id, label, icon: Icon, href }) => {
            const targetSection = href.replace('#', '');
            const isActive = activeSection === targetSection || activeSection === id;

            return (
              <a
                key={id}
                href={href}
                onClick={() => {
                  if (onSectionChange) onSectionChange(targetSection);
                  if (onClose) onClose();
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && (
                  <ChevronRight size={14} className="opacity-60" />
                )}
              </a>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
