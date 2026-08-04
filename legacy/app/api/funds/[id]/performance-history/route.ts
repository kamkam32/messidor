import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API pour récupérer l'historique des performances d'un fonds OPCVM
 *
 * GET /api/funds/[id]/performance-history
 *
 * Query params:
 * - from: Date de début (YYYY-MM-DD) - défaut: 30 jours avant
 * - to: Date de fin (YYYY-MM-DD) - défaut: aujourd'hui
 * - metric: Métrique à récupérer (nav, perf_1m, perf_ytd, etc.) - défaut: toutes
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Paramètres de la requête
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const metric = searchParams.get('metric');

    // Dates par défaut
    const endDate = to || new Date().toISOString().split('T')[0];
    const startDate = from || (() => {
      const date = new Date();
      date.setDate(date.getDate() - 30);
      return date.toISOString().split('T')[0];
    })();

    const supabase = await createClient();

    // Construire la requête
    let query = supabase
      .from('fund_performance_history')
      .select('*')
      .eq('fund_id', id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching performance history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch performance history' },
        { status: 500 }
      );
    }

    // Si une métrique spécifique est demandée, filtrer les données
    if (metric && data) {
      const filteredData = data.map(item => ({
        date: item.date,
        [metric]: (item as Record<string, unknown>)[metric],
        source_file: item.source_file
      }));

      return NextResponse.json({
        fundId: id,
        metric,
        period: { from: startDate, to: endDate },
        dataPoints: filteredData.length,
        data: filteredData
      });
    }

    return NextResponse.json({
      fundId: id,
      period: { from: startDate, to: endDate },
      dataPoints: data?.length || 0,
      data: data || []
    });

  } catch (error) {
    console.error('Performance history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
