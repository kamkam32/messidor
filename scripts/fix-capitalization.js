const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, '..', 'content', 'blog');

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function fixCapitalizationInFile(filePath) {
  console.log(`Traitement de ${path.basename(filePath)}...`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Corriger les titres H2 et H3 qui commencent par une minuscule
  content = content.replace(/^(###+)\s+([a-zà-ÿ])/gm, (match, hashes, firstChar) => {
    modified = true;
    return `${hashes} ${firstChar.toUpperCase()}`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ ${path.basename(filePath)} corrigé`);
    return true;
  } else {
    console.log(`  ${path.basename(filePath)} déjà OK`);
    return false;
  }
}

// Traiter tous les fichiers .md dans le dossier blog
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md'));
let totalFixed = 0;

console.log(`\nCorrection des majuscules dans ${files.length} articles...\n`);

files.forEach(file => {
  const filePath = path.join(blogDir, file);
  if (fixCapitalizationInFile(filePath)) {
    totalFixed++;
  }
});

console.log(`\n✅ Terminé ! ${totalFixed} fichier(s) corrigé(s).`);
