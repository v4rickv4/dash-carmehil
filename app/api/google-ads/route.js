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
 *   limit      number      Max rows to return
 *
 * Returns: JSON object with:
 *   success: true
 *   count: number
 *   rows: array of Google Ads records
 *   accounts: array of { conta_id, conta_nome }
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate') || null;
    const endDate   = searchParams.get('endDate')   || null;
    const campaign  = searchParams.get('campaign')  || null;
    const accountId = searchParams.get('accountId') || null;
    const limitRaw  = searchParams.get('limit');
    const limit     = limitRaw ? parseInt(limitRaw, 10) : null;

    const sql = `
      SELECT
        id,
        data,
        campanha AS nome_campanha,
        id_campanha,
        investimento,
        impressoes,
        cliques,
        conversoes AS leads,
        valor_conversao,
        conta_id,
        conta_nome,
        cpc,
        ctr,
        cpm,
        atualizado_em
      FROM public.dados_google_ads
      WHERE
        ($1::date IS NULL OR data >= $1::date)
        AND ($2::date IS NULL OR data <= $2::date)
        AND ($3::text IS NULL OR campanha = $3)
        AND ($4::text IS NULL OR conta_id = $4)
      ORDER BY data DESC, investimento DESC
      ${limit ? 'LIMIT $5' : ''}
    `;

    const params = limit
      ? [startDate, endDate, campaign, accountId, limit]
      : [startDate, endDate, campaign, accountId];

    // Fetch records and distinct accounts list in parallel
    const [result, accountsRes] = await Promise.all([
      query(sql, params),
      query(`
        SELECT DISTINCT conta_id, conta_nome
        FROM public.dados_google_ads
        WHERE conta_id IS NOT NULL
        ORDER BY conta_nome ASC
      `),
    ]);

    return NextResponse.json({
      success: true,
      count: result.rowCount,
      rows: result.rows,
      accounts: accountsRes.rows,
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
