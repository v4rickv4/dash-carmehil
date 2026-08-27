import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ads
 *
 * Query parameters (all optional):
 *   latestOnly   boolean  If 'true', returns records from MAX(data) (latest 24h)
 *   level        string   'creative' (id_anuncio IS NOT NULL) or 'campaign' (id_anuncio IS NULL)
 *   creativesOnly boolean  If 'true', filters id_anuncio IS NOT NULL
 *   startDate    YYYY-MM-DD Filter records from this date (inclusive)
 *   endDate      YYYY-MM-DD Filter records up to this date (inclusive)
 *   campaign     string   Exact campaign name filter (nome_campanha)
 *   limit        number   Max rows to return (default: no limit)
 *
 * Returns: JSON array of records from public.dados_meta_ads_carmehil
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const latestOnly    = searchParams.get('latestOnly') === 'true';
    const level         = searchParams.get('level');
    const creativesOnly = searchParams.get('creativesOnly') === 'true' || level === 'creative' || latestOnly;
    const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
    const defaultStartDate = `${todayStr.slice(0, 7)}-01`;
    const defaultEndDate   = todayStr;

    const rawStartDate  = searchParams.get('startDate');
    const rawEndDate    = searchParams.get('endDate');

    const startDate     = (rawStartDate && rawStartDate.trim() !== '') ? rawStartDate.trim() : defaultStartDate;
    const endDate       = (rawEndDate && rawEndDate.trim() !== '')     ? rawEndDate.trim()   : defaultEndDate;
    const campaign      = searchParams.get('campaign')  || null;
    const limitRaw      = searchParams.get('limit');
    const limit         = limitRaw ? parseInt(limitRaw, 10) : null;

    let sql;
    let params;

    if (latestOnly) {
      // Query only the most recent date in the database (last 24h) for Creatives (id_anuncio IS NOT NULL)
      sql = `
        SELECT
          id,
          data,
          id_anuncio,
          nome_anuncio,
          id_conjunto,
          nome_conjunto,
          id_campanha,
          nome_campanha,
          investimento,
          impressoes,
          alcance,
          cliques,
          leads,
          custo_por_lead,
          mensagens,
          custo_por_mensagem,
          url_imagem,
          status
        FROM public.dados_meta_ads_carmehil
        WHERE data = (SELECT MAX(data) FROM public.dados_meta_ads_carmehil)
          AND (${creativesOnly ? 'id_anuncio IS NOT NULL' : 'id_anuncio IS NULL'})
          AND ($1::text IS NULL OR nome_campanha = $1)
        ORDER BY investimento DESC
        ${limit ? 'LIMIT $2' : ''}
      `;
      params = limit ? [campaign, limit] : [campaign];
    } else {
      // Standard query:
      // - Visão Geral, Performance & Gráfico Diário: id_anuncio IS NULL
      // - Creatives: id_anuncio IS NOT NULL
      sql = `
        SELECT
          id,
          data,
          id_anuncio,
          nome_anuncio,
          id_conjunto,
          nome_conjunto,
          id_campanha,
          nome_campanha,
          investimento,
          impressoes,
          alcance,
          cliques,
          leads,
          custo_por_lead,
          mensagens,
          custo_por_mensagem,
          url_imagem,
          status
        FROM public.dados_meta_ads_carmehil
        WHERE
          ($1::date IS NULL OR data >= $1::date)
          AND ($2::date IS NULL OR data <= $2::date)
          AND ($3::text IS NULL OR nome_campanha = $3)
          AND (${creativesOnly ? 'id_anuncio IS NOT NULL' : 'id_anuncio IS NULL'})
        ORDER BY data DESC
        ${limit ? 'LIMIT $4' : ''}
      `;
      params = limit
        ? [startDate, endDate, campaign, limit]
        : [startDate, endDate, campaign];
    }

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: result.rowCount,
      rows: result.rows,
    });
  } catch (error) {
    console.error('[API /api/ads] Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      hasEnvVar: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL),
    });

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Não foi possível carregar os dados. Verifique a conexão com o banco de dados.',
        code: error.code || 'DATABASE_ERROR',
      },
      { status: 500 }
    );
  }
}
