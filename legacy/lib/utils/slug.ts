/**
 * Génère un slug SEO-friendly à partir d'un texte
 * @param text - Le texte à convertir en slug
 * @returns Le slug généré
 *
 * @example
 * generateSlug("WAFA GESTION MONÉTAIRE PLUS") // "wafa-gestion-monetaire-plus"
 * generateSlug("ATTIJARI FINANCES CORP - VALEURS") // "attijari-finances-corp-valeurs"
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    // Remplacer les caractères accentués
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remplacer les espaces et caractères spéciaux par des tirets
    .replace(/[^a-z0-9]+/g, '-')
    // Supprimer les tirets multiples
    .replace(/-+/g, '-')
    // Supprimer les tirets en début et fin
    .replace(/^-|-$/g, '')
}

/**
 * Génère un slug unique pour un fonds OPCVM
 * Inclut le code du fonds si disponible pour garantir l'unicité
 * @param name - Nom du fonds
 * @param code - Code du fonds (optionnel)
 * @returns Le slug unique
 *
 * @example
 * generateFundSlug("WAFA GESTION MONÉTAIRE PLUS", "WGM1")
 * // "wafa-gestion-monetaire-plus-wgm1"
 */
export function generateFundSlug(name: string, code?: string | null): string {
  const nameSlug = generateSlug(name)

  if (code) {
    const codeSlug = generateSlug(code)
    return `${nameSlug}-${codeSlug}`
  }

  return nameSlug
}
