import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * API Route: Récupérer les données historiques de la bourse depuis Supabase
 *
 * Query params:
 * - index: Code de l'indice (MASI, MADEX, MSI20, etc.)
 * - type: Type de données (intraday, composition)
 * - from: Date de début (YYYY-MM-DD)
 * - to: Date de fin (YYYY-MM-DD)
 * - limit: Nombre maximum de résultats
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const indexCode = searchParams.get('index') || 'MASI';
    const dataType = searchParams.get('type') || 'intraday';
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '30');

    // Créer le client Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Construire la requête
    let query = supabase
      .from('bourse_history')
      .select('*')
      .eq('index_code', indexCode)
      .eq('data_type', dataType)
      .order('date', { ascending: false });

    // Ajouter les filtres de dates si fournis
    if (fromDate) {
      query = query.gte('date', fromDate);
    }

    if (toDate) {
      query = query.lte('date', toDate);
    }

    // Ajouter la limite
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching history from Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
      params: {
        index: indexCode,
        type: dataType,
        from: fromDate,
        to: toDate,
        limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in bourse history API:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
