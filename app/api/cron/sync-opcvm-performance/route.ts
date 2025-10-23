import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseOPCVMExcel, downloadTodayOPCVMFile } from '@/lib/services/opcvm-excel-parser';
import axios from 'axios';

/**
 * Cron job quotidien pour télécharger et synchroniser les performances OPCVM
 * Fréquence: Tous les jours à 19h (après la publication ASFIM)
 * Route: /api/cron/sync-opcvm-performance
 *
 * Le jeudi: télécharge aussi le fichier HEBDOMADAIRE (qui contient plus de fonds)
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification du cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    const isThursday = today.getDay() === 4;

    console.log(`🚀 Starting OPCVM performance sync... (${isThursday ? 'JEUDI' : 'jour normal'})`);

    // Créer un client Supabase avec service_role pour bypass RLS
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

    // 1. Télécharger le fichier Excel du jour depuis ASFIM
    console.log('📥 Downloading today\'s QUOTIDIEN file from ASFIM...');
    const downloadResult = await downloadTodayOPCVMFile();

    if (!downloadResult) {
      console.warn('⚠️ Could not download file from ASFIM, checking local archives...');
      return NextResponse.json({
        success: false,
        error: 'Could not download file from ASFIM',
        message: 'Please upload file manually'
      }, { status: 404 });
    }

    const { buffer, fileName } = downloadResult;
    console.log(`✅ Downloaded: ${fileName}`);

    // 2. Archiver le fichier dans Supabase Storage
    console.log('💾 Archiving file to Supabase Storage...');
    const storagePath = `${new Date().getFullYear()}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('opcvm-archives')
      .upload(storagePath, buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    } else {
      console.log(`✅ Archived to: ${storagePath}`);
    }

    // 3. Parser le fichier Excel
    console.log('📊 Parsing Excel file...');
    const parsedData = await parseOPCVMExcel(buffer, fileName);
    console.log(`✅ Parsed ${parsedData.funds.length} funds for date ${parsedData.date}`);

    // 4. Récupérer tous les fonds de la DB
    const { data: dbFunds, error: fundsError } = await supabase
      .from('funds')
      .select('id, code, name, isin_code');

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    console.log(`📚 Found ${dbFunds.length} funds in database`);

    // 5. Matcher et insérer les performances
    const results = {
      matched: 0,
      inserted: 0,
      updated: 0,
      notMatched: [] as string[],
      errors: [] as string[]
    };

    for (const excelFund of parsedData.funds) {
      try {
        // Essayer de matcher par code ISIN, puis par code OPCVM, puis par nom
        let dbFund = dbFunds.find(f =>
          excelFund.isinCode && f.isin_code === excelFund.isinCode
        );

        if (!dbFund && excelFund.code) {
          dbFund = dbFunds.find(f => f.code === excelFund.code);
        }

        if (!dbFund) {
          // Fuzzy match par nom (normaliser les espaces et la casse)
          const normalizedExcelName = excelFund.name.toLowerCase().replace(/\s+/g, ' ').trim();
          dbFund = dbFunds.find(f =>
            f.name.toLowerCase().replace(/\s+/g, ' ').trim() === normalizedExcelName
          );
        }

        if (!dbFund) {
          results.notMatched.push(excelFund.name);
          continue;
        }

        results.matched++;

        // Insérer/Update dans fund_performance_history
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
            source_file: fileName,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'fund_id,date'
          });

        if (perfError) {
          results.errors.push(`${dbFund.name}: ${perfError.message}`);
        } else {
          results.inserted++;
        }

        // Mettre à jour aussi la table funds avec les dernières valeurs
        const { error: fundUpdateError } = await supabase
          .from('funds')
          .update({
            nav: excelFund.nav,
            asset_value: excelFund.assetValue,
            perf_1d: excelFund.perf1d,
            perf_1w: excelFund.perf1w,
            perf_1m: excelFund.perf1m,
            perf_3m: excelFund.perf3m,
            perf_6m: excelFund.perf6m,
            ytd_performance: excelFund.perfYtd,
            perf_1y: excelFund.perf1y,
            perf_2y: excelFund.perf2y,
            perf_3y: excelFund.perf3y,
            perf_5y: excelFund.perf5y,
            updated_at: new Date().toISOString()
          })
          .eq('id', dbFund.id);

        if (fundUpdateError) {
          results.errors.push(`Fund update ${dbFund.name}: ${fundUpdateError.message}`);
        } else {
          results.updated++;
        }

      } catch (error) {
        results.errors.push(`${excelFund.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('✅ QUOTIDIEN sync completed:', results);

    // Si on est jeudi, télécharger aussi le fichier hebdomadaire
    let hebdoResults = null;
    if (isThursday) {
      console.log('\n🗓️  C\'est jeudi ! Téléchargement du fichier HEBDOMADAIRE...');

      try {
        const formatDate = (date: Date): string => {
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        };

        const formattedDate = formatDate(today);
        const hebdoFileName = `Tableau des Performances Hebdomadaires au ${formattedDate}.xlsx`;
        const hebdoUrl = `https://asfim.ma/static/tableau-des-performances/${encodeURIComponent(hebdoFileName)}`;

        console.log(`📥 Downloading: ${hebdoFileName}`);
        const response = await axios.get(hebdoUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        const hebdoBuffer = Buffer.from(response.data);
        console.log(`✅ Hebdo file downloaded`);

        // Archiver le fichier hebdo
        const hebdoStoragePath = `hebdo/${today.getFullYear()}/${hebdoFileName}`;
        const { error: hebdoUploadError } = await supabase.storage
          .from('opcvm-archives')
          .upload(hebdoStoragePath, hebdoBuffer, {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            upsert: true
          });

        if (hebdoUploadError) {
          console.error('Hebdo storage error:', hebdoUploadError);
        } else {
          console.log(`💾 Hebdo archived: ${hebdoStoragePath}`);
        }

        // Parser le fichier hebdo
        const hebdoParsed = await parseOPCVMExcel(hebdoBuffer, hebdoFileName);
        console.log(`✅ Hebdo parsed: ${hebdoParsed.funds.length} funds`);

        hebdoResults = {
          matched: 0,
          inserted: 0,
          notMatched: [] as string[],
          errors: [] as string[]
        };

        // Insérer les fonds hebdo dans fund_performance_history
        for (const excelFund of hebdoParsed.funds) {
          try {
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
              hebdoResults.notMatched.push(excelFund.name);
              continue;
            }

            hebdoResults.matched++;

            const { error: perfError } = await supabase
              .from('fund_performance_history')
              .upsert({
                fund_id: dbFund.id,
                date: hebdoParsed.date,
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
                source_file: hebdoFileName,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'fund_id,date'
              });

            if (perfError) {
              hebdoResults.errors.push(`${dbFund.name}: ${perfError.message}`);
            } else {
              hebdoResults.inserted++;
            }
          } catch (error) {
            hebdoResults.errors.push(`${excelFund.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        console.log('✅ HEBDO sync completed:', hebdoResults);
      } catch (error) {
        console.error('⚠️ Hebdo download failed:', error);
        hebdoResults = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    return NextResponse.json({
      success: true,
      date: parsedData.date,
      fileName,
      totalFunds: parsedData.funds.length,
      matched: results.matched,
      inserted: results.inserted,
      updated: results.updated,
      notMatched: results.notMatched,
      errors: results.errors,
      hebdomadaire: hebdoResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ OPCVM sync failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
