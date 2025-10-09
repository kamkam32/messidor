-- Migration: Bourse History Table
-- Description: Store historical market data from Casablanca Stock Exchange
-- Created: 2025-10-09

-- Table pour stocker l'historique des données de la bourse
CREATE TABLE IF NOT EXISTS public.bourse_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date et heure de la donnée
  date DATE NOT NULL,
  scrape_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Type de données (quote, intraday, composition)
  data_type VARCHAR(50) NOT NULL,

  -- Code de l'indice (MASI, MADEX, MSI20, etc.)
  index_code VARCHAR(50) NOT NULL,

  -- Données JSON (flexible pour différents types de données)
  data JSONB NOT NULL,

  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Index pour recherche rapide
  CONSTRAINT unique_bourse_record UNIQUE(date, data_type, index_code)
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_bourse_history_date ON public.bourse_history(date DESC);
CREATE INDEX idx_bourse_history_index_code ON public.bourse_history(index_code);
CREATE INDEX idx_bourse_history_data_type ON public.bourse_history(data_type);
CREATE INDEX idx_bourse_history_scrape_timestamp ON public.bourse_history(scrape_timestamp DESC);

-- Index GIN pour recherche dans le JSON
CREATE INDEX idx_bourse_history_data ON public.bourse_history USING GIN(data);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bourse_history ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les données de la bourse
CREATE POLICY "Anyone can read bourse history"
  ON public.bourse_history
  FOR SELECT
  USING (true);

-- Policy: Seuls les utilisateurs authentifiés peuvent insérer (pour le cron job)
CREATE POLICY "Authenticated users can insert bourse history"
  ON public.bourse_history
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policy: Seuls les utilisateurs authentifiés peuvent mettre à jour
CREATE POLICY "Authenticated users can update bourse history"
  ON public.bourse_history
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Function pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_bourse_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_bourse_history_updated_at_trigger
  BEFORE UPDATE ON public.bourse_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bourse_history_updated_at();

-- Commentaires pour documentation
COMMENT ON TABLE public.bourse_history IS 'Historical market data from Casablanca Stock Exchange';
COMMENT ON COLUMN public.bourse_history.date IS 'Trading date of the data';
COMMENT ON COLUMN public.bourse_history.scrape_timestamp IS 'When the data was scraped';
COMMENT ON COLUMN public.bourse_history.data_type IS 'Type of data: quote, intraday, or composition';
COMMENT ON COLUMN public.bourse_history.index_code IS 'Index code: MASI, MADEX, MSI20, etc.';
COMMENT ON COLUMN public.bourse_history.data IS 'JSON data containing the market information';
