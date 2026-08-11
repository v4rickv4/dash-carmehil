import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/ads
 *
 * Query parameters (all optional):
 *   startDate  YYYY-MM-DD  Filter records from this date (inclusive)
 *   endDate    YYYY-MM-DD  Filter records up to this date (inclusive)
 *   campaign   string      Exact campaign name filter (nome_campanha)
 *   limit      number      Max rows to return (default: no limit)
 *
 * Returns: JSON array of records from public.dados_meta_ads_oeste
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get('startDate') || null;
    const endDate   = searchParams.get('endDate')   || null;
    const campaign  = searchParams.get('campaign')  || null;
    const limitRaw  = searchParams.get('limit');
    const limit     = limitRaw ? parseInt(limitRaw, 10) : null;

    // All column names are lowercase — no quotes needed.
    // Table is schema-qualified: public.dados_meta_ads_oeste
    const sql = `
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
      FROM public.dados_meta_ads_oeste
      WHERE
        ($1::date IS NULL OR data >= $1::date)
        AND ($2::date IS NULL OR data <= $2::date)
        AND ($3::text IS NULL OR nome_campanha = $3)
      ORDER BY data DESC
      ${limit ? 'LIMIT $4' : ''}
    `;

    const params = limit
      ? [startDate, endDate, campaign, limit]
      : [startDate, endDate, campaign];

    const result = await query(sql, params);

    return NextResponse.json({
      success: true,
      count: result.rowCount,
      rows: result.rows,
    });
  } catch (error) {
    // Log full error server-side only — never expose internals to browser
    console.error('[API /api/ads] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Não foi possível carregar os dados. Verifique a conexão com o banco de dados.',
      },
      { status: 500 }
    );
  }
}
