/**
 * Metrics computation helpers.
 * All derived metrics (CPL) are computed from totals — NOT averaged per-row —
 * to ensure correct weighted values.
 *
 * Note: Conversions/Leads unifies native leads + messaging conversations (WhatsApp/Messenger).
 *
 * Column mapping (public.dados_meta_ads_oeste):
 *   nome_campanha  ← Campaign name
 *   investimento   ← Investment (R$)
 *   impressoes     ← Impressions
 *   alcance        ← Reach
 *   cliques        ← Clicks
 *   leads          ← Native form leads
 *   mensagens      ← WhatsApp/Messenger conversations initiated
 *   url_imagem     ← Creative image URL
 */

/** Safely parse a value to number, returning 0 for null/undefined/NaN */
export function safeNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** Safe division — returns 0 instead of Infinity or NaN */
function safeDivide(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Compute aggregate totals from an array of raw DB rows.
 * @param {Object[]} rows
 * @returns {Object} totals object
 */
export function computeTotals(rows) {
  if (!rows || rows.length === 0) {
    return {
      investimento: 0,
      impressoes: 0,
      alcance: 0,
      cliques: 0,
      leads: 0,
      leadsNativos: 0,
      mensagens: 0,
      cpl: 0,
      recordCount: 0,
    };
  }

  const investimento   = rows.reduce((s, r) => s + safeNum(r.investimento), 0);
  const impressoes     = rows.reduce((s, r) => s + safeNum(r.impressoes),   0);
  const alcance        = rows.reduce((s, r) => s + safeNum(r.alcance),      0);
  const cliques        = rows.reduce((s, r) => s + safeNum(r.cliques),      0);
  const leadsNativos   = rows.reduce((s, r) => s + safeNum(r.leads),        0);
  const mensagens      = rows.reduce((s, r) => s + safeNum(r.mensagens),    0);
  const totalLeads     = leadsNativos + mensagens;

  return {
    investimento,
    impressoes,
    alcance,
    cliques,
    leads:        totalLeads,
    leadsNativos,
    mensagens,
    cpl:          safeDivide(investimento, totalLeads),
    recordCount:  rows.length,
  };
}

/**
 * Group rows by campaign name and compute per-campaign totals.
 * @param {Object[]} rows
 * @returns {Object[]} array sorted by investimento desc
 */
export function groupByCampaign(rows) {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    const name = row.nome_campanha || 'Sem nome';
    if (!map[name]) {
      map[name] = {
        campanha: name,
        id_campanha: row.id_campanha,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        leads: 0,
        leadsNativos: 0,
        mensagens: 0,
      };
    }
    const g = map[name];
    const rowLeadsNativos = safeNum(row.leads);
    const rowMensagens = safeNum(row.mensagens);
    
    g.investimento   += safeNum(row.investimento);
    g.impressoes     += safeNum(row.impressoes);
    g.alcance        += safeNum(row.alcance);
    g.cliques        += safeNum(row.cliques);
    g.leadsNativos   += rowLeadsNativos;
    g.mensagens      += rowMensagens;
    g.leads          += (rowLeadsNativos + rowMensagens);
  }

  return Object.values(map)
    .map((g) => ({
      ...g,
      cpl: safeDivide(g.investimento, g.leads),
    }))
    .sort((a, b) => b.investimento - a.investimento);
}

/**
 * Build time-series data for charts.
 * Groups rows by date and sums the requested metric.
 * @param {Object[]} rows
 * @param {string} metric  Key from DB row: 'investimento' | 'leads' | 'cliques' | 'impressoes' | 'alcance'
 * @returns {Object[]} array of { date, value } sorted by date asc
 */
export function buildTimeSeriesData(rows, metric = 'investimento') {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    if (!row.data) continue;
    const dateKey =
      row.data instanceof Date
        ? row.data.toISOString().slice(0, 10)
        : String(row.data).slice(0, 10);

    if (!map[dateKey]) map[dateKey] = 0;
    if (metric === 'leads') {
      map[dateKey] += (safeNum(row.leads) + safeNum(row.mensagens));
    } else {
      map[dateKey] += safeNum(row[metric]);
    }
  }

  return Object.entries(map)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Build dual time-series for Investment × Leads/Conversions chart.
 * @param {Object[]} rows
 * @returns {Object[]} array of { date, investimento, leads }
 */
export function buildInvestimentoLeadsTimeSeries(rows) {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    if (!row.data) continue;
    const dateKey =
      row.data instanceof Date
        ? row.data.toISOString().slice(0, 10)
        : String(row.data).slice(0, 10);

    if (!map[dateKey]) map[dateKey] = { date: dateKey, investimento: 0, leads: 0 };
    map[dateKey].investimento += safeNum(row.investimento);
    map[dateKey].leads        += (safeNum(row.leads) + safeNum(row.mensagens));
  }

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Compute campaign investment distribution for pie/donut chart.
 * @param {Object[]} campaignGroups  Output of groupByCampaign()
 * @param {number}   totalInvestimento
 * @returns {Object[]} array of { name, value, percent }
 */
export function buildDistributionData(campaignGroups, totalInvestimento) {
  if (!campaignGroups || campaignGroups.length === 0) return [];

  return campaignGroups.map((c) => ({
    name: c.campanha,
    value: c.investimento,
    percent: safeDivide(c.investimento, totalInvestimento) * 100,
  }));
}

/**
 * Get unique campaign names from rows.
 * @param {Object[]} rows
 * @returns {string[]}
 */
export function getCampaignNames(rows) {
  if (!rows || rows.length === 0) return [];
  const names = new Set(rows.map((r) => r.nome_campanha).filter(Boolean));
  return Array.from(names).sort();
}

/**
 * Generate automatic insights from aggregated campaign data.
 * @param {Object[]} campaignGroups  Output of groupByCampaign()
 * @param {Object}   totals          Output of computeTotals()
 * @returns {Object[]} array of insight objects
 */
export function computeInsights(campaignGroups, totals) {
  if (!campaignGroups || campaignGroups.length === 0) return [];

  const insights = [];

  // Best campaign by leads / conversões
  const byLeads = [...campaignGroups].sort((a, b) => b.leads - a.leads);
  if (byLeads[0] && byLeads[0].leads > 0) {
    insights.push({
      id: 'best-leads',
      type: 'positive',
      icon: 'Users',
      title: 'Melhor campanha em conversões',
      description: `"${byLeads[0].campanha}" gerou ${Math.round(byLeads[0].leads)} leads/conversões no período.`,
      metric: byLeads[0].leads,
      metricLabel: 'Leads/Mensagens',
    });
  }

  // Lowest CPL (only campaigns with leads)
  const withLeads = campaignGroups.filter((c) => c.leads > 0);
  if (withLeads.length > 0) {
    const byCpl = [...withLeads].sort((a, b) => a.cpl - b.cpl);
    insights.push({
      id: 'lowest-cpl',
      type: 'positive',
      icon: 'TrendingDown',
      title: 'Menor custo por lead/conversão',
      description: `"${byCpl[0].campanha}" apresentou CPL de R$ ${byCpl[0].cpl.toFixed(2).replace('.', ',')}.`,
      metric: byCpl[0].cpl,
      metricLabel: 'CPL',
    });
  }

  // Highest investment share
  const topInvest = campaignGroups[0];
  if (topInvest && totals.investimento > 0) {
    const share = safeDivide(topInvest.investimento, totals.investimento) * 100;
    insights.push({
      id: 'top-investment',
      type: 'info',
      icon: 'PieChart',
      title: 'Maior investimento',
      description: `"${topInvest.campanha}" recebeu ${share.toFixed(0)}% do orçamento do período.`,
      metric: share,
      metricLabel: 'do orçamento',
    });
  }

  return insights;
}

/**
 * Sort campaign groups by a given metric key.
 * @param {Object[]} groups
 * @param {string}   sortBy
 */
export function sortCampaigns(groups, sortBy) {
  const sorted = [...groups];
  switch (sortBy) {
    case 'leads':        return sorted.sort((a, b) => b.leads - a.leads);
    case 'cpl':          return sorted.sort((a, b) => a.cpl - b.cpl);
    case 'cliques':      return sorted.sort((a, b) => b.cliques - a.cliques);
    case 'investimento':
    default:             return sorted.sort((a, b) => b.investimento - a.investimento);
  }
}
