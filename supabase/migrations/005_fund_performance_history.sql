-- Create fund_performance_history table to store daily historical performance data
CREATE TABLE public.fund_performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID NOT NULL REFERENCES public.funds(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Valeur Liquidative et Actif Net
  nav DECIMAL(15, 2),
  asset_value DECIMAL(20, 2),

  -- Performances sur différentes périodes
  perf_1d DECIMAL(10, 4),
  perf_1w DECIMAL(10, 4),
  perf_1m DECIMAL(10, 4),
  perf_3m DECIMAL(10, 4),
  perf_6m DECIMAL(10, 4),
  perf_ytd DECIMAL(10, 4),
  perf_1y DECIMAL(10, 4),
  perf_2y DECIMAL(10, 4),
  perf_3y DECIMAL(10, 4),
  perf_5y DECIMAL(10, 4),

  -- Métadonnées
  source_file TEXT,  -- Nom du fichier Excel source
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Contrainte d'unicité : un seul enregistrement par fonds par jour
  CONSTRAINT unique_fund_date UNIQUE(fund_id, date)
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_fund_perf_history_fund_id ON public.fund_performance_history(fund_id);
CREATE INDEX idx_fund_perf_history_date ON public.fund_performance_history(date DESC);
CREATE INDEX idx_fund_perf_history_fund_date ON public.fund_performance_history(fund_id, date DESC);

-- Trigger pour updated_at
CREATE TRIGGER handle_fund_perf_history_updated_at
  BEFORE UPDATE ON public.fund_performance_history
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.fund_performance_history ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire l'historique
CREATE POLICY "Anyone can view fund performance history"
  ON public.fund_performance_history
  FOR SELECT
  TO public
  USING (true);

-- Seuls les utilisateurs authentifiés et service_role peuvent insérer/modifier
CREATE POLICY "Authenticated users can insert fund performance history"
  ON public.fund_performance_history
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fund performance history"
  ON public.fund_performance_history
  FOR UPDATE
  TO authenticated, service_role
  USING (true);

-- Vue pour obtenir la dernière performance de chaque fonds
CREATE OR REPLACE VIEW public.latest_fund_performance AS
SELECT DISTINCT ON (fund_id)
  fund_id,
  date,
  nav,
  asset_value,
  perf_1d,
  perf_1w,
  perf_1m,
  perf_3m,
  perf_6m,
  perf_ytd,
  perf_1y,
  perf_2y,
  perf_3y,
  perf_5y,
  source_file,
  created_at
FROM public.fund_performance_history
ORDER BY fund_id, date DESC;

-- Accès public à la vue
GRANT SELECT ON public.latest_fund_performance TO public;
