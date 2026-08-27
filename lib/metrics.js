/**
 * Metrics computation helpers.
 * All derived metrics (CPL, CTR, CPC, CPM) are computed from totals — NOT averaged per-row —
 * to ensure correct weighted values.
 *
 * Supports Meta Ads (dados_meta_ads_carmehil) and Google Ads (dados_google_ads_carmehil).
 */

/** Safely parse a value to number, returning 0 for null/undefined/NaN */
export function safeNum(v) {
  if (v === null || v === undefined || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

/** Safe division — returns 0 instead of Infinity or NaN */
export function safeDivide(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  return numerator / denominator;
}

/**
 * Compute aggregate totals from an array of raw DB rows (Meta, Google, or Combined).
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
      valorConversao: 0,
      cpl: 0,
      ctr: 0,
      cpc: 0,
      cpm: 0,
      recordCount: 0,
    };
  }

  const investimento    = rows.reduce((s, r) => s + safeNum(r.investimento), 0);
  const impressoes      = rows.reduce((s, r) => s + safeNum(r.impressoes),   0);
  const alcance         = rows.reduce((s, r) => s + safeNum(r.alcance),      0);
  const cliques         = rows.reduce((s, r) => s + safeNum(r.cliques),      0);
  const leadsNativos    = rows.reduce((s, r) => s + safeNum(r.leads || r.conversoes), 0);
  const mensagens       = rows.reduce((s, r) => s + safeNum(r.mensagens),    0);
  const valorConversao  = rows.reduce((s, r) => s + safeNum(r.valor_conversao), 0);

  const totalLeads = leadsNativos + mensagens;

  return {
    investimento,
    impressoes,
    alcance,
    cliques,
    leads:         totalLeads,
    leadsNativos,
    mensagens,
    valorConversao,
    cpl:           safeDivide(investimento, totalLeads),
    ctr:           safeDivide(cliques, impressoes) * 100,
    cpc:           safeDivide(investimento, cliques),
    cpm:           safeDivide(investimento, impressoes) * 1000,
    recordCount:   rows.length,
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
    const name = row.nome_campanha || row.campanha || 'Sem nome';
    if (!map[name]) {
      map[name] = {
        campanha: name,
        id_campanha: row.id_campanha,
        conta_id: row.conta_id,
        conta_nome: row.conta_nome,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        leads: 0,
        leadsNativos: 0,
        mensagens: 0,
        valorConversao: 0,
      };
    }
    const g = map[name];
    const rowLeadsNativos = safeNum(row.leads || row.conversoes);
    const rowMensagens = safeNum(row.mensagens);
    const rowValConv = safeNum(row.valor_conversao);

    g.investimento     += safeNum(row.investimento);
    g.impressoes       += safeNum(row.impressoes);
    g.alcance          += safeNum(row.alcance);
    g.cliques          += safeNum(row.cliques);
    g.leadsNativos     += rowLeadsNativos;
    g.mensagens        += rowMensagens;
    g.leads            += (rowLeadsNativos + rowMensagens);
    g.valorConversao   += rowValConv;
  }

  return Object.values(map)
    .map((g) => ({
      ...g,
      cpl: safeDivide(g.investimento, g.leads),
      ctr: safeDivide(g.cliques, g.impressoes) * 100,
      cpc: safeDivide(g.investimento, g.cliques),
      cpm: safeDivide(g.investimento, g.impressoes) * 1000,
    }))
    .sort((a, b) => b.investimento - a.investimento);
}

/**
 * Group rows by Ad Group (grupo_anuncios) and compute aggregate metrics.
 * @param {Object[]} rows
 * @returns {Object[]} array sorted by investimento desc
 */
export function groupByAdGroup(rows) {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    const groupName = row.grupo_anuncios || row.nome_conjunto || 'Sem Grupo';
    const key = `${row.nome_campanha || row.campanha || ''}_${groupName}`;

    if (!map[key]) {
      map[key] = {
        grupo_anuncios: groupName,
        nome_campanha: row.nome_campanha || row.campanha || 'Geral',
        conta_id: row.conta_id,
        conta_nome: row.conta_nome,
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        leads: 0,
        valorConversao: 0,
      };
    }
    const g = map[key];
    const rowLeads = safeNum(row.leads || row.conversoes) + safeNum(row.mensagens);

    g.investimento   += safeNum(row.investimento);
    g.impressoes     += safeNum(row.impressoes);
    g.cliques        += safeNum(row.cliques);
    g.leads          += rowLeads;
    g.valorConversao += safeNum(row.valor_conversao);
  }

  return Object.values(map)
    .map((g) => ({
      ...g,
      cpl: safeDivide(g.investimento, g.leads),
      ctr: safeDivide(g.cliques, g.impressoes) * 100,
      cpc: safeDivide(g.investimento, g.cliques),
      cpm: safeDivide(g.investimento, g.impressoes) * 1000,
    }))
    .sort((a, b) => b.investimento - a.investimento);
}

/**
 * Group rows by Keyword (palavra_chave) and compute aggregate metrics.
 * @param {Object[]} rows
 * @returns {Object[]} array sorted by investimento desc
 */
export function groupByKeyword(rows) {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    const kw = row.palavra_chave;
    if (!kw || kw === '-') continue;

    const key = `${row.grupo_anuncios || ''}_${kw}`;

    if (!map[key]) {
      map[key] = {
        palavra_chave: kw,
        grupo_anuncios: row.grupo_anuncios || 'Geral',
        nome_campanha: row.nome_campanha || row.campanha || 'Geral',
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        leads: 0,
        valorConversao: 0,
      };
    }
    const g = map[key];
    const rowLeads = safeNum(row.leads || row.conversoes) + safeNum(row.mensagens);

    g.investimento   += safeNum(row.investimento);
    g.impressoes     += safeNum(row.impressoes);
    g.cliques        += safeNum(row.cliques);
    g.leads          += rowLeads;
    g.valorConversao += safeNum(row.valor_conversao);
  }

  return Object.values(map)
    .map((g) => ({
      ...g,
      cpl: safeDivide(g.investimento, g.leads),
      ctr: safeDivide(g.cliques, g.impressoes) * 100,
      cpc: safeDivide(g.investimento, g.cliques),
      cpm: safeDivide(g.investimento, g.impressoes) * 1000,
    }))
    .sort((a, b) => b.investimento - a.investimento);
}

/**
 * Group rows by creative and compute aggregate metrics per creative.
 * @param {Object[]} rows
 * @returns {Object[]} array of grouped creative objects
 */
export function groupByCreative(rows) {
  if (!rows || rows.length === 0) return [];

  const map = {};

  for (const row of rows) {
    const key = row.id_anuncio || row.url_imagem || `${row.nome_campanha}_${row.nome_anuncio}`;

    if (!map[key]) {
      map[key] = {
        id: key,
        id_anuncio: row.id_anuncio,
        nome_anuncio: row.nome_anuncio,
        nome_campanha: row.nome_campanha,
        id_campanha: row.id_campanha,
        url_imagem: row.url_imagem,
        status: row.status,
        data: row.data,
        investimento: 0,
        impressoes: 0,
        alcance: 0,
        cliques: 0,
        leads: 0,
        leadsNativos: 0,
        mensagens: 0,
        recordCount: 0,
      };
    }

    const g = map[key];
    const rowLeadsNativos = safeNum(row.leads || row.conversoes);
    const rowMensagens = safeNum(row.mensagens);

    g.investimento   += safeNum(row.investimento);
    g.impressoes     += safeNum(row.impressoes);
    g.alcance        += safeNum(row.alcance);
    g.cliques        += safeNum(row.cliques);
    g.leadsNativos   += rowLeadsNativos;
    g.mensagens      += rowMensagens;
    g.leads          += (rowLeadsNativos + rowMensagens);
    g.recordCount    += 1;

    if (!g.url_imagem && row.url_imagem) {
      g.url_imagem = row.url_imagem;
    }
    if (row.data && (!g.data || new Date(row.data) > new Date(g.data))) {
      g.data = row.data;
    }
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
 * @param {string} metric
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
      map[dateKey] += (safeNum(row.leads || row.conversoes) + safeNum(row.mensagens));
    } else if (metric === 'valorConversao') {
      map[dateKey] += safeNum(row.valor_conversao || row.valorConversao);
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
    map[dateKey].leads        += (safeNum(row.leads || row.conversoes) + safeNum(row.mensagens));
  }

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Compute campaign investment distribution for pie/donut chart.
 * @param {Object[]} campaignGroups
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
  const names = new Set(rows.map((r) => r.nome_campanha || r.campanha).filter(Boolean));
  return Array.from(names).sort();
}

/**
 * Generate automatic insights from aggregated campaign data.
 * @param {Object[]} campaignGroups
 * @param {Object}   totals
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
      title: 'Melhor campanha em leads',
      description: `"${byLeads[0].campanha}" gerou ${Math.round(byLeads[0].leads)} leads no período.`,
      metric: byLeads[0].leads,
      metricLabel: 'Leads Totais',
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
      title: 'Menor custo por lead (CPL)',
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
