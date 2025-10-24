/**
 * Script pour trouver TOUS les fichiers hebdomadaires existants
 * en testant toutes les dates possibles depuis 2022
 */

import axios from 'axios';

/**
 * Formater la date au format DD-MM-YYYY
 */
function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Générer tous les jeudis entre deux dates
 */
function getAllThursdays(startDate: Date, endDate: Date): Date[] {
  const thursdays: Date[] = [];
  const current = new Date(startDate);

  // Trouver le premier jeudi
  while (current.getDay() !== 4) {
    current.setDate(current.getDate() + 1);
    if (current > endDate) return thursdays;
  }

  // Ajouter tous les jeudis
  while (current <= endDate) {
    thursdays.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }

  return thursdays;
}

/**
 * Tester si un fichier existe (HEAD request)
 */
async function fileExists(date: Date): Promise<boolean> {
  const formattedDate = formatDate(date);
  // Format avec TIRETS (pas d'espaces)
  const fileName = `Tableau-des-Performances-Hebdomadaires-au-${formattedDate}.xlsx`;
  const url = `https://asfim.ma/static/tableau-des-performances/${fileName}`;

  try {
    await axios.head(url, { timeout: 10000 });
    return true;
  } catch (error) {
    return false;
  }
}

async function bruteForceFindFiles() {
  console.log('🔍 Recherche EXHAUSTIVE des fichiers hebdomadaires...\n');
  console.log('⚠️  Cela peut prendre plusieurs minutes (~150 requêtes)\n');

  // Période complète : 01/01/2022 → aujourd'hui
  const startDate = new Date('2022-01-01');
  const endDate = new Date();

  const thursdays = getAllThursdays(startDate, endDate);
  console.log(`📅 Test de ${thursdays.length} jeudis depuis ${startDate.toLocaleDateString('fr-FR')}\n`);

  const existingFiles: Date[] = [];
  let tested = 0;
  let lastProgress = 0;

  // Tester chaque jeudi
  for (const thursday of thursdays) {
    tested++;
    const progress = Math.floor((tested / thursdays.length) * 100);

    // Afficher la progression tous les 10%
    if (progress >= lastProgress + 10) {
      console.log(`⏳ Progression: ${progress}% (${tested}/${thursdays.length}) - ${existingFiles.length} fichiers trouvés`);
      lastProgress = progress;
    }

    const exists = await fileExists(thursday);

    if (exists) {
      existingFiles.push(thursday);
      const dateStr = thursday.toLocaleDateString('fr-FR');
      console.log(`   ✅ TROUVÉ: ${dateStr}`);
    }

    // Petite pause pour ne pas surcharger le serveur
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n🎉 RECHERCHE TERMINÉE !\n`);
  console.log('═══════════════════════════════════════════\n');
  console.log(`✅ Fichiers trouvés: ${existingFiles.length} / ${thursdays.length} jeudis testés\n`);

  if (existingFiles.length > 0) {
    // Trier par date
    existingFiles.sort((a, b) => a.getTime() - b.getTime());

    console.log('📅 DATES DISPONIBLES (format YYYY-MM-DD):\n');
    console.log('const HEBDO_DATES = [');
    existingFiles.forEach(date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      console.log(`  '${year}-${month}-${day}', // ${date.toLocaleDateString('fr-FR')}`);
    });
    console.log('];\n');

    console.log(`📊 STATISTIQUES:`);
    console.log(`   Première date: ${existingFiles[0].toLocaleDateString('fr-FR')}`);
    console.log(`   Dernière date: ${existingFiles[existingFiles.length - 1].toLocaleDateString('fr-FR')}`);

    const daysDiff = Math.floor((existingFiles[existingFiles.length - 1].getTime() - existingFiles[0].getTime()) / (1000 * 60 * 60 * 24));
    console.log(`   Période couverte: ${Math.floor(daysDiff / 7)} semaines (~${Math.floor(daysDiff / 30)} mois)`);

    console.log(`\n💡 PROCHAINE ÉTAPE:`);
    console.log(`   Copiez le tableau "HEBDO_DATES" ci-dessus dans le fichier:`);
    console.log(`   scripts/download-specific-hebdo.ts`);
    console.log(`   Puis lancez: npx tsx scripts/download-specific-hebdo.ts\n`);
  } else {
    console.log('⚠️  Aucun fichier trouvé. Le serveur ASFIM pourrait avoir changé sa structure.\n');
  }
}

bruteForceFindFiles();
