import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API pour récupérer l'historique des performances de plusieurs fonds OPCVM
 *
 * GET /api/funds/performance-history?ids=uuid1,uuid2,uuid3&from=2024-01-01&to=2024-12-31&metric=perf_ytd
 *
 * Query params:
 * - ids: IDs des fonds séparés par des virgules (requis)
 * - from: Date de début (YYYY-MM-DD) - défaut: 30 jours avant
 * - to: Date de fin (YYYY-MM-DD) - défaut: aujourd'hui
 * - metric: Métrique à récupérer (nav, perf_1m, perf_ytd, etc.) - défaut: toutes
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // IDs des fonds
    const idsParam = searchParams.get('ids');
    if (!idsParam) {
      return NextResponse.json(
        { error: 'Missing required parameter: ids' },
        { status: 400 }
      );
    }

    const fundIds = idsParam.split(',').map(id => id.trim());

    // Paramètres de période
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

    // Récupérer les infos des fonds
    const { data: funds, error: fundsError } = await supabase
      .from('funds')
      .select('id, name, code')
      .in('id', fundIds);

    if (fundsError) {
      console.error('Error fetching funds:', fundsError);
      return NextResponse.json(
        { error: 'Failed to fetch funds' },
        { status: 500 }
      );
    }

    // Récupérer l'historique pour tous les fonds
    const { data: history, error: historyError } = await supabase
      .from('fund_performance_history')
      .select('*')
      .in('fund_id', fundIds)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (historyError) {
      console.error('Error fetching performance history:', historyError);
      return NextResponse.json(
        { error: 'Failed to fetch performance history' },
        { status: 500 }
      );
    }

    // Organiser les données par fonds
    const result = funds?.map(fund => {
      const fundHistory = history?.filter(h => h.fund_id === fund.id) || [];

      // Si une métrique spécifique est demandée
      if (metric) {
        return {
          fundId: fund.id,
          fundName: fund.name,
          fundCode: fund.code,
          metric,
          dataPoints: fundHistory.length,
          data: fundHistory.map(item => ({
            date: item.date,
            value: (item as Record<string, unknown>)[metric]
          }))
        };
      }

      return {
        fundId: fund.id,
        fundName: fund.name,
        fundCode: fund.code,
        dataPoints: fundHistory.length,
        data: fundHistory
      };
    });

    return NextResponse.json({
      period: { from: startDate, to: endDate },
      metric: metric || 'all',
      funds: result
    });

  } catch (error) {
    console.error('Performance history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
