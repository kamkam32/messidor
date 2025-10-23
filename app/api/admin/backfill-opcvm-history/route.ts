import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel, downloadOPCVMFilesForPeriod } from '@/lib/services/opcvm-excel-parser';

/**
 * API Admin pour télécharger rétroactivement l'historique OPCVM depuis ASFIM
 *
 * Usage:
 * POST /api/admin/backfill-opcvm-history
 * Body: {
 *   "startDate": "2024-01-01",
 *   "endDate": "2024-12-31",
 *   "type": "quotidien" // ou "hebdomadaire"
 * }
 *
 * Headers: Authorization: Bearer <ADMIN_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized backfill request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parser les paramètres
    const body = await request.json();
    const { startDate, endDate, type = 'quotidien' } = body;

    if (!startDate || !endDate) {
      return NextResponse.json({
        error: 'Missing required parameters: startDate, endDate'
      }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      }, { status: 400 });
    }

    if (start > end) {
      return NextResponse.json({
        error: 'startDate must be before endDate'
      }, { status: 400 });
    }

    console.log(`🚀 Starting backfill from ${startDate} to ${endDate} (${type})`);

    // Créer un client Supabase avec service_role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Récupérer tous les fonds de la DB
    const { data: dbFunds, error: fundsError } = await supabase
      .from('funds')
      .select('id, code, name, isin_code');

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    console.log(`📚 Found ${dbFunds.length} funds in database`);

    // Télécharger tous les fichiers de la période
    console.log(`📥 Downloading files from ASFIM for period ${startDate} to ${endDate}...`);
    const files = await downloadOPCVMFilesForPeriod(start, end, type as 'quotidien' | 'hebdomadaire');

    console.log(`✅ Downloaded ${files.length} files`);

    if (files.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No files found for the specified period',
        filesDownloaded: 0
      });
    }

    // Traiter chaque fichier
    const results = {
      filesProcessed: 0,
      filesWithErrors: 0,
      totalFundsProcessed: 0,
      totalInserted: 0,
      totalUpdated: 0,
      errors: [] as string[],
      fileDetails: [] as Array<{
        fileName: string;
        date: string;
        fundsProcessed: number;
        matched: number;
        notMatched: string[];
      }>
    };

    for (const file of files) {
      try {
        console.log(`\n📊 Processing ${file.fileName}...`);

        // 1. Archiver le fichier dans Supabase Storage
        const storagePath = `${new Date(file.date).getFullYear()}/${file.fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('opcvm-archives')
          .upload(storagePath, file.buffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true
          });

        if (uploadError) {
          console.error(`Storage upload error for ${file.fileName}:`, uploadError);
        } else {
          console.log(`💾 Archived to: ${storagePath}`);
        }

        // 2. Parser le fichier
        const parsedData = await parseOPCVMExcel(file.buffer, file.fileName);
        console.log(`✅ Parsed ${parsedData.funds.length} funds`);

        // 3. Traiter chaque fonds
        const fileResult = {
          fileName: file.fileName,
          date: parsedData.date,
          fundsProcessed: parsedData.funds.length,
          matched: 0,
          notMatched: [] as string[]
        };

        for (const excelFund of parsedData.funds) {
          try {
            // Matcher le fonds
            let dbFund = dbFunds.find(f =>
              excelFund.isinCode && f.isin_code === excelFund.isinCode
            );

            if (!dbFund && excelFund.code) {
              dbFund = dbFunds.find(f => f.code === excelFund.code);
            }

            if (!dbFund) {
              const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim();
              dbFund = dbFunds.find(f =>
                f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName
              );
            }

            if (!dbFund) {
              fileResult.notMatched.push(excelFund.name);
              continue;
            }

            fileResult.matched++;

            // Insérer dans fund_performance_history
            const { error: perfError } = await supabase
              .from('fund_performance_history')
              .upsert({
                fund_id: dbFund.id,
                date: parsedData.date,
                nav: excelFund.nav,
                asset_value: excelFund.assetValue,
                perf_1d: excelFund.perf1d,
                perf_1w: excelFund.perf1w,
                perf_1m: excelFund.perf1m,
                perf_3m: excelFund.perf3m,
                perf_6m: excelFund.perf6m,
                perf_ytd: excelFund.perfYtd,
                perf_1y: excelFund.perf1y,
                perf_2y: excelFund.perf2y,
                perf_3y: excelFund.perf3y,
                perf_5y: excelFund.perf5y,
                source_file: file.fileName,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'fund_id,date'
              });

            if (perfError) {
              results.errors.push(`${file.fileName} - ${dbFund.name}: ${perfError.message}`);
            } else {
              results.totalInserted++;
            }

          } catch (error) {
            results.errors.push(
              `${file.fileName} - ${excelFund.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }

        results.fileDetails.push(fileResult);
        results.filesProcessed++;
        results.totalFundsProcessed += fileResult.fundsProcessed;

        console.log(`✅ Completed ${file.fileName}: ${fileResult.matched} matched`);

      } catch (error) {
        results.filesWithErrors++;
        results.errors.push(
          `${file.fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        console.error(`❌ Error processing ${file.fileName}:`, error);
      }
    }

    // Mettre à jour la table funds avec les dernières valeurs
    console.log('\n🔄 Updating funds table with latest values...');
    const { data: latestPerf } = await supabase
      .from('latest_fund_performance')
      .select('*');

    if (latestPerf) {
      for (const perf of latestPerf) {
        await supabase
          .from('funds')
          .update({
            nav: perf.nav,
            asset_value: perf.asset_value,
            perf_1d: perf.perf_1d,
            perf_1w: perf.perf_1w,
            perf_1m: perf.perf_1m,
            perf_3m: perf.perf_3m,
            perf_6m: perf.perf_6m,
            ytd_performance: perf.perf_ytd,
            perf_1y: perf.perf_1y,
            perf_2y: perf.perf_2y,
            perf_3y: perf.perf_3y,
            perf_5y: perf.perf_5y,
            updated_at: new Date().toISOString()
          })
          .eq('id', perf.fund_id);

        results.totalUpdated++;
      }
    }

    console.log('✅ Backfill completed:', results);

    return NextResponse.json({
      success: true,
      period: { startDate, endDate, type },
      filesDownloaded: files.length,
      filesProcessed: results.filesProcessed,
      filesWithErrors: results.filesWithErrors,
      totalFundsProcessed: results.totalFundsProcessed,
      totalInserted: results.totalInserted,
      totalUpdated: results.totalUpdated,
      fileDetails: results.fileDetails,
      errors: results.errors.slice(0, 100), // Limiter à 100 erreurs pour ne pas surcharger la réponse
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Backfill failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
