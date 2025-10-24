-- Ajouter une colonne slug pour les URLs SEO-friendly
ALTER TABLE funds
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Créer un index unique sur le slug pour des recherches rapides
CREATE UNIQUE INDEX IF NOT EXISTS funds_slug_idx ON funds(slug);

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN funds.slug IS 'URL-friendly slug généré depuis le nom et le code du fonds pour le SEO';
