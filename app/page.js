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
  const [activeSection, setActiveSection]   = useState('visao-geral');
  const [sidebarOpen,   setSidebarOpen]     = useState(false);

  // ── Data state ────────────────────────────────────────
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── Period + filters state ────────────────────────────
  const [period, setPeriod] = useState('30d');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate:   '',
    campaign:  '',
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

  /* ── Fetch ───────────────────────────────────────────── */
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate)   params.set('endDate',   filters.endDate);
      if (filters.campaign)  params.set('campaign',  filters.campaign);

      const res = await fetch(`/api/ads?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Erro ${res.status}`);
      }

      const data = await res.json();
      setRows(data.rows ?? []);
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
      setError(err.message || 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [filters.startDate, filters.endDate, filters.campaign]);

  // Initial load + whenever date/campaign filter changes
  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  /* ── Derived data ────────────────────────────────────── */
  const totals = useMemo(() => computeTotals(rows), [rows]);

  const campaignGroups = useMemo(
    () => sortCampaigns(groupByCampaign(rows), filters.sortBy),
    [rows, filters.sortBy]
  );

  const campaignNames = useMemo(() => getCampaignNames(rows), [rows]);

  /* ── Filter helpers ──────────────────────────────────── */
  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    // If user manually edits dates, switch to 'custom' period label
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
    setFilters({ startDate: '', endDate: '', campaign: '', sortBy: 'investimento' });
  }

  /* ── Render ──────────────────────────────────────────── */
  const isEmpty = !loading && !error && rows.length === 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="main-content flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header
          period={period}
          onPeriodChange={handlePeriodChange}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
          onMenuToggle={() => setSidebarOpen(true)}
        />

        {/* Filter bar */}
        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          campaigns={campaignNames}
        />

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 space-y-6 max-w-full overflow-hidden">
          {error ? (
            <ErrorState message={error} onRetry={() => fetchData(false)} />
          ) : isEmpty ? (
            <EmptyState onClearFilters={handleClearFilters} />
          ) : (
            <>
              {/* ── KPI Grid ── */}
              <section id="visao-geral" aria-label="KPIs principais">
                <KPIGrid totals={totals} loading={loading} />
              </section>

              {/* ── Performance Chart ── */}
              <section id="performance" aria-label="Evolução de performance">
                <PerformanceChart rows={rows} loading={loading} />
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

              {/* ── Criativos ── */}
              <section id="criativos" aria-label="Performance dos criativos">
                <CreativeGrid rows={rows} loading={loading} />
              </section>
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-slate-200 mt-auto">
          <p className="text-xs text-slate-400 text-center">
            Dashboard Meta Ads — Oeste Marine &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
}
