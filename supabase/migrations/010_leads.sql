-- Migration: Leads (capture de prospects)
-- Description: Table centrale des leads (formulaire contact + simulateurs).
--              RLS activée : insertion publique autorisée, lecture privée
--              (aucune policy SELECT pour anon — réservé au service-role / admin).
-- Created: 2026-08-04

CREATE TABLE IF NOT EXISTS public.leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Identité du prospect
  email             TEXT NOT NULL,
  first_name        TEXT,
  last_name         TEXT,
  phone             TEXT,
  message           TEXT,
  subject           TEXT,

  -- Origine
  source            TEXT DEFAULT 'website',
  simulator_type    TEXT,
  payload           JSONB,

  -- Attribution marketing
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  referer           TEXT,
  landing_url       TEXT,

  -- Consentement & suivi
  consent_marketing BOOLEAN DEFAULT FALSE,
  status            TEXT DEFAULT 'new'
);

-- Index pour le tri chronologique (back-office)
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads (created_at DESC);

-- Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Policy : insertion autorisée pour anon et authenticated (capture publique).
-- WITH CHECK (true) : n'importe qui peut créer un lead.
CREATE POLICY "Public can insert leads"
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- NB : aucune policy SELECT/UPDATE/DELETE => les leads restent invisibles
-- aux rôles anon/authenticated. Seul le service-role (bypass RLS) peut les lire.

COMMENT ON TABLE public.leads IS 'Prospects capturés via formulaire contact et simulateurs';
COMMENT ON COLUMN public.leads.source IS 'Origine du lead : website, simulator, etc.';
COMMENT ON COLUMN public.leads.simulator_type IS 'Type de simulateur si source = simulator';
COMMENT ON COLUMN public.leads.payload IS 'Données additionnelles (résultats de simulation, etc.)';
COMMENT ON COLUMN public.leads.status IS 'Statut de suivi commercial : new, contacted, qualified, closed';
