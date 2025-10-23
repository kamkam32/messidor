-- Migration pour améliorer le matching des fonds OPCVM avec les données ASFIM
-- Cette migration met à jour les codes Morocco pour correspondre aux codes Maroclear d'ASFIM

-- Ajouter un index sur le nom pour le fuzzy matching
CREATE INDEX IF NOT EXISTS idx_funds_name_lower ON public.funds(LOWER(name));

-- Fonction helper pour normaliser les noms de fonds (pour le matching)
CREATE OR REPLACE FUNCTION normalize_fund_name(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Index fonctionnel sur le nom normalisé
CREATE INDEX IF NOT EXISTS idx_funds_normalized_name
  ON public.funds(normalize_fund_name(name));

-- Commentaires sur les colonnes importantes
COMMENT ON COLUMN public.funds.isin_code IS 'Code ISIN international - utilisé pour matcher avec ASFIM';
COMMENT ON COLUMN public.funds.morocco_code IS 'Code Maroclear (ex: 3013) - utilisé pour matcher avec ASFIM';
COMMENT ON COLUMN public.funds.code IS 'Code interne (peut être le même que morocco_code ou un code personnalisé)';

-- Vue pour faciliter le matching
CREATE OR REPLACE VIEW public.fund_matching_helper AS
SELECT
  id,
  code,
  morocco_code,
  isin_code,
  name,
  normalize_fund_name(name) as normalized_name,
  is_active
FROM public.funds
WHERE is_active = true;

COMMENT ON VIEW public.fund_matching_helper IS 'Vue helper pour faciliter le matching des fonds avec les données ASFIM';

-- Fonction pour trouver un fonds par différents critères
CREATE OR REPLACE FUNCTION find_fund_by_identifiers(
  p_isin_code TEXT DEFAULT NULL,
  p_morocco_code TEXT DEFAULT NULL,
  p_name TEXT DEFAULT NULL
)
RETURNS TABLE (
  fund_id UUID,
  matched_by TEXT
) AS $$
BEGIN
  -- Essayer par ISIN d'abord
  IF p_isin_code IS NOT NULL THEN
    RETURN QUERY
    SELECT id, 'isin'::TEXT
    FROM public.funds
    WHERE isin_code = p_isin_code
    AND is_active = true
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Essayer par code Maroclear
  IF p_morocco_code IS NOT NULL THEN
    RETURN QUERY
    SELECT id, 'morocco_code'::TEXT
    FROM public.funds
    WHERE morocco_code = p_morocco_code
    AND is_active = true
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Essayer par code interne
  IF p_morocco_code IS NOT NULL THEN
    RETURN QUERY
    SELECT id, 'code'::TEXT
    FROM public.funds
    WHERE code = p_morocco_code
    AND is_active = true
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Essayer par nom normalisé
  IF p_name IS NOT NULL THEN
    RETURN QUERY
    SELECT id, 'name'::TEXT
    FROM public.funds
    WHERE normalize_fund_name(name) = normalize_fund_name(p_name)
    AND is_active = true
    LIMIT 1;

    IF FOUND THEN RETURN; END IF;
  END IF;

  -- Aucun résultat
  RETURN;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION find_fund_by_identifiers IS 'Trouve un fonds par ISIN, code Maroclear ou nom normalisé';

-- Stats sur l'historique des performances
CREATE OR REPLACE VIEW public.fund_performance_stats AS
SELECT
  f.id as fund_id,
  f.name as fund_name,
  f.code as fund_code,
  COUNT(fph.id) as total_records,
  MIN(fph.date) as first_record_date,
  MAX(fph.date) as last_record_date,
  MAX(fph.updated_at) as last_updated_at
FROM public.funds f
LEFT JOIN public.fund_performance_history fph ON f.id = fph.fund_id
WHERE f.is_active = true
GROUP BY f.id, f.name, f.code
ORDER BY total_records DESC;

COMMENT ON VIEW public.fund_performance_stats IS 'Statistiques sur l''historique des performances par fonds';

-- Accès public aux vues
GRANT SELECT ON public.fund_matching_helper TO public;
GRANT SELECT ON public.fund_performance_stats TO public;
