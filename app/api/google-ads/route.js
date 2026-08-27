import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/google-ads
 *
 * Query parameters (all optional):
 *   startDate  YYYY-MM-DD  Filter records from this date (inclusive)
 *   endDate    YYYY-MM-DD  Filter records up to this date (inclusive)
 *   campaign   string      Campaign name filter
 *   accountId  string      Filter by conta_id
 *   adGroup    string      Filter by grupo_anuncios
 *   keyword    string      Filter by palavra_chave
 *   limit      number      Max rows to return
 *
 * Returns: JSON object with:
 *   success: true
 *   count: number
 *   rows: array of Google Ads Carmehil records
 *   accounts: array of { conta_id, conta_nome }
 *   adGroups: array of distinct grupo_anuncios strings
 *   keywords: array of distinct palavra_chave strings
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate') || null;
    const endDate   = searchParams.get('endDate')   || null;
    const campaign  = searchParams.get('campaign')  || null;
    const accountId = searchParams.get('accountId') || null;
    const adGroup   = searchParams.get('adGroup')   || null;
    const keyword   = searchParams.get('keyword')   || null;
    const limitRaw  = searchParams.get('limit');
    const limit     = limitRaw ? parseInt(limitRaw, 10) : null;

    let targetTable = 'public.dados_google_ads_carmehil';

    // Verify if dados_google_ads_carmehil has records, fallback to dados_google_ads if empty
    try {
      const checkRes = await query(`SELECT COUNT(*) FROM ${targetTable}`);
      if (parseInt(checkRes.rows[0].count, 10) === 0) {
        targetTable = 'public.dados_google_ads';
      }
    } catch {
      targetTable = 'public.dados_google_ads';
    }

    const sql = `
      SELECT
        id,
        data,
        conta_id,
        COALESCE(conta_nome, 'Google Ads Carmehil') AS conta_nome,
        campanha AS nome_campanha,
        COALESCE(grupo_anuncios, 'Geral') AS grupo_anuncios,
        COALESCE(palavra_chave, '-') AS palavra_chave,
        investimento,
        impressoes,
        cliques,
        COALESCE(leads, 0) AS leads,
        custo_por_lead,
        COALESCE(valor_conversao, 0) AS valor_conversao,
        cpm,
        ctr,
        atualizado_em
      FROM ${targetTable}
      WHERE
        ($1::date IS NULL OR data >= $1::date)
        AND ($2::date IS NULL OR data <= $2::date)
        AND ($3::text IS NULL OR campanha = $3)
        AND ($4::text IS NULL OR conta_id = $4)
        AND ($5::text IS NULL OR grupo_anuncios = $5)
        AND ($6::text IS NULL OR palavra_chave = $6)
      ORDER BY data DESC, investimento DESC
      ${limit ? 'LIMIT $7' : ''}
    `;

    const params = limit
      ? [startDate, endDate, campaign, accountId, adGroup, keyword, limit]
      : [startDate, endDate, campaign, accountId, adGroup, keyword];

    // Fetch records, distinct accounts, distinct ad groups, and distinct keywords in parallel
    const [result, accountsRes, adGroupsRes, keywordsRes] = await Promise.all([
      query(sql, params),
      query(`
        SELECT DISTINCT conta_id, COALESCE(conta_nome, 'Google Ads Carmehil') AS conta_nome
        FROM ${targetTable}
        WHERE conta_id IS NOT NULL
        ORDER BY conta_nome ASC
      `),
      query(`
        SELECT DISTINCT grupo_anuncios
        FROM ${targetTable}
        WHERE grupo_anuncios IS NOT NULL
        ORDER BY grupo_anuncios ASC
      `),
      query(`
        SELECT DISTINCT palavra_chave
        FROM ${targetTable}
        WHERE palavra_chave IS NOT NULL AND palavra_chave != '-'
        ORDER BY palavra_chave ASC
        LIMIT 100
      `),
    ]);

    return NextResponse.json({
      success: true,
      count: result.rowCount,
      rows: result.rows,
      accounts: accountsRes.rows,
      adGroups: adGroupsRes.rows.map((r) => r.grupo_anuncios),
      keywords: keywordsRes.rows.map((r) => r.palavra_chave),
    });
  } catch (error) {
    console.error('[API /api/google-ads] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Não foi possível carregar os dados do Google Ads.',
      },
      { status: 500 }
    );
  }
}
