'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import KPIGrid from '@/components/KPIGrid';
import PerformanceChart from '@/components/PerformanceChart';
import CampaignDistribution from '@/components/CampaignDistribution';
import CampaignTable from '@/components/CampaignTable';
import CreativeGrid from '@/components/CreativeGrid';
import InsightsPanel from '@/components/InsightsPanel';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';

import {
  computeTotals,
  groupByCampaign,
  getCampaignNames,
  sortCampaigns,
} from '@/lib/metrics';

/* ─── Helpers ─────────────────────────────────────────── */

/** Compute startDate / endDate from a preset period key */
function getPeriodDates(period) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  switch (period) {
    case 'today':
      return { startDate: today, endDate: today };

    case '7d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 6);
      return { startDate: d.toISOString().slice(0, 10), endDate: today };
    }

    case '30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 29);
      return { startDate: d.toISOString().slice(0, 10), endDate: today };
    }

    case 'this-month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: start.toISOString().slice(0, 10), endDate: today };
    }

    case 'last-month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end   = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        startDate: start.toISOString().slice(0, 10),
        endDate:   end.toISOString().slice(0, 10),
      };
    }

    case 'custom':
    default:
      return { startDate: '', endDate: '' };
  }
}

/* ─── Page ────────────────────────────────────────────── */
export default function DashboardPage() {
  // ── UI state ──────────────────────────────────────────
  const [activePlatform, setActivePlatform] = useState('meta'); // 'meta' | 'google' | 'all'
  const [activeSection,  setActiveSection]  = useState('visao-geral');
  const [sidebarOpen,    setSidebarOpen]    = useState(false);

  // ── Data state ────────────────────────────────────────
  const [metaRows,     setMetaRows]     = useState([]);
  const [googleRows,   setGoogleRows]   = useState([]);
  const [googleAccounts, setGoogleAccounts] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Period + filters state ────────────────────────────
  const [period, setPeriod] = useState('30d');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate:   '',
    campaign:  '',
    accountId: '',
    sortBy:    'investimento',
  });

  /* ── Derived dates from period preset ───────────────── */
  const periodDates = useMemo(() => getPeriodDates(period), [period]);

  // When period changes (not 'custom'), update date filters automatically
  useEffect(() => {
    if (period !== 'custom') {
      setFilters((prev) => ({
        ...prev,
        startDate: periodDates.startDate,
        endDate:   periodDates.endDate,
      }));
    }
  }, [period, periodDates]);

  /* ── Fetch Data ──────────────────────────────────────── */
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const metaParams = new URLSearchParams();
      if (filters.startDate) metaParams.set('startDate', filters.startDate);
      if (filters.endDate)   metaParams.set('endDate',   filters.endDate);
      if (filters.campaign)  metaParams.set('campaign',  filters.campaign);

      const googleParams = new URLSearchParams();
      if (filters.startDate) googleParams.set('startDate', filters.startDate);
      if (filters.endDate)   googleParams.set('endDate',   filters.endDate);
      if (filters.campaign)  googleParams.set('campaign',  filters.campaign);
      if (filters.accountId) googleParams.set('accountId', filters.accountId);

      const requests = [];
      if (activePlatform === 'meta' || activePlatform === 'all') {
        requests.push(fetch(`/api/ads?${metaParams.toString()}`).then((r) => r.json()));
      } else {
        requests.push(Promise.resolve({ rows: [] }));
      }

      if (activePlatform === 'google' || activePlatform === 'all') {
        requests.push(fetch(`/api/google-ads?${googleParams.toString()}`).then((r) => r.json()));
      } else {
        requests.push(Promise.resolve({ rows: [], accounts: [] }));
      }

      const [metaRes, googleRes] = await Promise.all(requests);

      setMetaRows(metaRes.rows ?? []);
      setGoogleRows(googleRes.rows ?? []);
      if (googleRes.accounts && googleRes.accounts.length > 0) {
        setGoogleAccounts(googleRes.accounts);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError(err.message || 'Erro ao carregar dados do dashboard.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [activePlatform, filters.startDate, filters.endDate, filters.campaign, filters.accountId]);

  // Load whenever activePlatform or filter changes
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  /* ── Combined Rows based on Active Platform ─────────── */
  const combinedRows = useMemo(() => {
    if (activePlatform === 'meta') return metaRows;
    if (activePlatform === 'google') return googleRows;
    return [...metaRows, ...googleRows];
  }, [activePlatform, metaRows, googleRows]);

  /* ── Derived metrics ─────────────────────────────────── */
  const totals = useMemo(() => computeTotals(combinedRows), [combinedRows]);

  const campaignGroups = useMemo(
    () => sortCampaigns(groupByCampaign(combinedRows), filters.sortBy),
    [combinedRows, filters.sortBy]
  );

  const campaignNames = useMemo(() => getCampaignNames(combinedRows), [combinedRows]);

  /* ── Filter helpers ──────────────────────────────────── */
  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    if (
      newFilters.startDate !== filters.startDate ||
      newFilters.endDate   !== filters.endDate
    ) {
      setPeriod('custom');
    }
  }

  function handlePeriodChange(newPeriod) {
    setPeriod(newPeriod);
  }

  function handleClearFilters() {
    setPeriod('30d');
    setFilters({ startDate: '', endDate: '', campaign: '', accountId: '', sortBy: 'investimento' });
  }

  function handlePlatformChange(platform) {
    setActivePlatform(platform);
  }

  /* ── Render ──────────────────────────────────────────── */
  const isEmpty = !loading && !error && combinedRows.length === 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activePlatform={activePlatform}
        onPlatformChange={handlePlatformChange}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="main-content flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          activePlatform={activePlatform}
          onPlatformChange={handlePlatformChange}
          period={period}
          onPeriodChange={handlePeriodChange}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          campaigns={campaignNames}
          accounts={googleAccounts}
          activePlatform={activePlatform}
        />

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-full overflow-hidden">
          {error ? (
            <ErrorState message={error} onRetry={() => fetchData(false)} />
          ) : isEmpty ? (
            <EmptyState onClearFilters={handleClearFilters} />
          ) : (
            <>
              {/* ── KPI Grid ── */}
              <section id="visao-geral" aria-label="KPIs principais">
                <KPIGrid totals={totals} loading={loading} activePlatform={activePlatform} />
              </section>

              {/* ── Performance Chart ── */}
              <section id="performance" aria-label="Evolução de performance">
                <PerformanceChart rows={combinedRows} loading={loading} />
              </section>

              {/* ── Investment Distribution ── */}
              <section aria-label="Distribuição do investimento">
                <CampaignDistribution
                  campaignGroups={campaignGroups}
                  totalInvestimento={totals.investimento}
                  loading={loading}
                />
              </section>

              {/* ── Campaign Table ── */}
              <section id="campanhas" aria-label="Performance por campanha">
                <CampaignTable campaignGroups={campaignGroups} loading={loading} />
              </section>

              {/* ── Insights ── */}
              <section id="relatorios" aria-label="Insights de performance">
                <InsightsPanel
                  campaignGroups={campaignGroups}
                  totals={totals}
                  loading={loading}
                />
              </section>

              {/* ── Criativos (Fixo nas últimas 24h para Meta Ads / Plataforma) ── */}
              {(activePlatform === 'meta' || activePlatform === 'all') && (
                <section id="criativos" aria-label="Performance dos criativos">
                  <CreativeGrid
                    campaignFilter={filters.campaign}
                    refreshTrigger={isRefreshing}
                  />
                </section>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200 mt-auto">
          <p className="text-xs text-slate-400 text-center">
            Dashboard Meta Ads & Google Ads — Carmehil Network &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
