'use client';

import {
  DollarSign,
  Users,
  Target,
  Eye,
  Radio,
  Pointer,
  TrendingUp,
  Percent,
} from 'lucide-react';
import KPICard from './KPICard';
import {
  formatCurrency,
  formatInteger,
  formatPercent,
} from '@/lib/formatters';

export default function KPIGrid({ totals, loading, activePlatform = 'meta' }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Primary row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-[120px] rounded-2xl" />
          ))}
        </div>
        {/* Secondary row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton h-[90px] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const {
    investimento = 0,
    impressoes = 0,
    alcance = 0,
    cliques = 0,
    leads = 0,
    cpl = 0,
    valorConversao = 0,
    ctr = 0,
    cpc = 0,
  } = totals || {};

  const platformTitle =
    activePlatform === 'google'
      ? 'Google Ads'
      : activePlatform === 'all'
      ? 'Visão Consolidada'
      : 'Meta Ads';

  const showValorConversao = valorConversao > 0 || activePlatform === 'google' || activePlatform === 'all';

  return (
    <div className="space-y-4 section-animate">
      {/* ── Row 1 — Primary KPIs ── */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${showValorConversao ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
        <KPICard
          title="Investimento Total"
          value={formatCurrency(investimento)}
          icon={DollarSign}
          iconColor="text-ocean-500"
          iconBg="bg-ocean-50"
          secondary={`Total no período (${platformTitle})`}
          tooltip="Valor total investido no período selecionado."
          variant="large"
        />
        <KPICard
          title="Conversões / Leads"
          value={formatInteger(leads)}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          secondary={activePlatform === 'google' ? 'Conversões de Meta' : 'Formulários + Mensagens'}
          tooltip="Total unificado de conversões/leads no período."
          variant="large"
        />
        <KPICard
          title="Custo por Conversão (CPL/CPA)"
          value={leads > 0 ? formatCurrency(cpl) : '—'}
          icon={Target}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          secondary={leads > 0 ? `${formatInteger(leads)} conversões no período` : 'Sem conversões no período'}
          tooltip="CPL/CPA = Investimento Total ÷ Total de Conversões."
          variant="large"
          trendIsGood={false}
        />
        {showValorConversao && (
          <KPICard
            title="Valor de Conversão"
            value={formatCurrency(valorConversao)}
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
            secondary="Receita estimada/gerada"
            tooltip="Valor financeiro total das conversões atribuídas."
            variant="large"
          />
        )}
      </div>

      {/* ── Row 2 — Secondary KPIs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Impressões"
          value={formatInteger(impressoes)}
          icon={Eye}
          iconColor="text-sky-600"
          iconBg="bg-sky-50"
          tooltip="Total de vezes que os anúncios foram exibidos."
          variant="small"
        />
        <KPICard
          title="Cliques"
          value={formatInteger(cliques)}
          icon={Pointer}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          tooltip="Total de cliques nos anúncios."
          variant="small"
        />
        <KPICard
          title="Taxa de Clique (CTR)"
          value={formatPercent(ctr)}
          icon={Percent}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          tooltip="CTR = (Cliques ÷ Impressões) × 100."
          variant="small"
        />
        <KPICard
          title="Custo por Clique (CPC)"
          value={formatCurrency(cpc)}
          icon={Radio}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
          tooltip="CPC Médio = Investimento Total ÷ Cliques Totais."
          variant="small"
        />
      </div>
    </div>
  );
}
