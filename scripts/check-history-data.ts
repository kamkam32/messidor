/**
 * Script pour diagnostiquer les données historiques
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkHistoryData() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing environment variables');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    console.log('🔍 Diagnostic des données historiques\n');

    // 1. Combien de lignes dans fund_performance_history ?
    const { count: historyCount } = await supabase
      .from('fund_performance_history')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total enregistrements dans fund_performance_history: ${historyCount}`);

    // 2. Combien de fonds ont de l'historique ?
    const { data: fundsWithHistory } = await supabase
      .from('fund_performance_history')
      .select('fund_id')
      .limit(10000);

    const uniqueFunds = new Set(fundsWithHistory?.map(h => h.fund_id) || []);
    console.log(`📈 Fonds avec historique: ${uniqueFunds.size}`);

    // 3. Prenons un exemple de fonds avec historique
    const { data: sampleHistory } = await supabase
      .from('fund_performance_history')
      .select('*, funds!inner(name)')
      .limit(5);

    console.log('\n📋 Exemples de données historiques:');
    sampleHistory?.forEach(h => {
      console.log(`   - ${(h.funds as any).name} (${h.fund_id}) : date=${h.date}, nav=${h.nav}`);
    });

    // 4. Testons un fonds spécifique (premier de la liste)
    if (sampleHistory && sampleHistory.length > 0) {
      const testFundId = sampleHistory[0].fund_id;
      const { data: fundData } = await supabase
        .from('funds')
        .select('*')
        .eq('id', testFundId)
        .single();

      console.log(`\n🧪 Test pour le fonds: ${fundData?.name}`);
      console.log(`   ID: ${fundData?.id}`);

      // Compter l'historique pour ce fonds
      const { count: fundHistoryCount } = await supabase
        .from('fund_performance_history')
        .select('*', { count: 'exact', head: true })
        .eq('fund_id', testFundId);

      console.log(`   Enregistrements d'historique: ${fundHistoryCount}`);

      // Récupérer quelques points
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const { data: yearHistory } = await supabase
        .from('fund_performance_history')
        .select('date, nav, perf_ytd')
        .eq('fund_id', testFundId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      console.log(`   Points sur 1 an: ${yearHistory?.length || 0}`);
      if (yearHistory && yearHistory.length > 0) {
        console.log(`   Premier point: ${yearHistory[0].date} (nav=${yearHistory[0].nav})`);
        console.log(`   Dernier point: ${yearHistory[yearHistory.length - 1].date} (nav=${yearHistory[yearHistory.length - 1].nav})`);
      }

      console.log(`\n✅ Ce fonds devrait afficher un graphique !`);
      console.log(`   URL: http://localhost:3000/dashboard/opcvm/${testFundId}`);
    }

    // 5. Vérifier les fonds SANS historique
    const { data: allFunds } = await supabase
      .from('funds')
      .select('id, name')
      .eq('is_active', true)
      .limit(1000);

    const fundsWithoutHistory = allFunds?.filter(f => !uniqueFunds.has(f.id)) || [];

    console.log(`\n⚠️  Fonds SANS historique: ${fundsWithoutHistory.length}`);
    if (fundsWithoutHistory.length > 0) {
      console.log('   Exemples (premiers 10):');
      fundsWithoutHistory.slice(0, 10).forEach(f => {
        console.log(`   - ${f.name} (${f.id})`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

checkHistoryData();
