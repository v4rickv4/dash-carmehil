'use client';

import {
  DollarSign,
  Users,
  Target,
  Eye,
  Radio,
  Pointer,
} from 'lucide-react';
import KPICard from './KPICard';
import {
  formatCurrency,
  formatInteger,
} from '@/lib/formatters';

export default function KPIGrid({ totals, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Primary row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-[120px] rounded-2xl" />
          ))}
        </div>
        {/* Secondary row skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
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
  } = totals || {};

  return (
    <div className="space-y-4 section-animate">
      {/* ── Row 1 — Primary KPIs (3 cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Investimento Total"
          value={formatCurrency(investimento)}
          icon={DollarSign}
          iconColor="text-ocean-500"
          iconBg="bg-ocean-50"
          secondary="Total no período"
          tooltip="Valor total investido em campanhas Meta Ads no período selecionado."
          variant="large"
        />
        <KPICard
          title="Leads & Conversões"
          value={formatInteger(leads)}
          icon={Users}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          secondary="Formulários + Mensagens"
          tooltip="Total unificado de formulários preenchidos e conversas de mensagens iniciadas no período."
          variant="large"
        />
        <KPICard
          title="Custo por Lead / Conversão"
          value={leads > 0 ? formatCurrency(cpl) : '—'}
          icon={Target}
          iconColor="text-violet-600"
          iconBg="bg-violet-50"
          secondary={leads > 0 ? `${formatInteger(leads)} conversões` : 'Sem conversões no período'}
          tooltip="CPL = Investimento Total ÷ Conversões Totais (Leads + Mensagens)."
          variant="large"
          trendIsGood={false}
        />
      </div>

      {/* ── Row 2 — Secondary KPIs (3 cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Alcance"
          value={formatInteger(alcance)}
          icon={Radio}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          tooltip="Número de pessoas únicas que viram pelo menos um anúncio no período."
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
      </div>
    </div>
  );
}
