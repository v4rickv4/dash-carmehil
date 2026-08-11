/**
 * Formatting helpers — Brazilian locale, currency and number formatting.
 * All functions are null-safe and return a dash "—" for invalid/missing values.
 */

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const INT = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const DECIMAL = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format as Brazilian currency: R$ 1.234,56 */
export function formatCurrency(value) {
  const n = Number(value);
  if (isNaN(n) || value === null || value === undefined) return '—';
  return BRL.format(n);
}

/** Format as integer with thousand separator: 12.345 */
export function formatInteger(value) {
  const n = Number(value);
  if (isNaN(n) || value === null || value === undefined) return '—';
  return INT.format(Math.round(n));
}

/** Format as percentage with 2 decimals: 2,84% */
export function formatPercent(value) {
  const n = Number(value);
  if (isNaN(n) || value === null || value === undefined) return '—';
  return DECIMAL.format(n) + '%';
}

/** Format as decimal number: 3,14 */
export function formatDecimal(value, decimals = 2) {
  const n = Number(value);
  if (isNaN(n) || value === null || value === undefined) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

/** Format date to DD/MM/YYYY */
export function formatDate(value) {
  if (!value) return '—';
  try {
    // Handle both Date objects and ISO strings
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    // Use UTC to avoid timezone-shifting the date from the DB
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
}

/** Format date to short version: 01/08 */
export function formatDateShort(value) {
  if (!value) return '—';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return '—';
  }
}

/** Compact number format: 12.400 → 12,4k */
export function formatCompact(value) {
  const n = Number(value);
  if (isNaN(n)) return '—';
  if (n >= 1_000_000) return DECIMAL.format(n / 1_000_000) + 'M';
  if (n >= 1_000) return DECIMAL.format(n / 1_000) + 'k';
  return INT.format(n);
}

/** Trend badge text: +12,4% or -5,8% */
export function formatTrend(value) {
  const n = Number(value);
  if (isNaN(n)) return null;
  const sign = n >= 0 ? '+' : '';
  return `${sign}${DECIMAL.format(n)}%`;
}
