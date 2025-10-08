-- Update funds table to add more OPCVM-specific fields
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS isin_code TEXT;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS morocco_code TEXT;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS management_company TEXT;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS legal_nature TEXT; -- SICAV, FCP
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS classification TEXT; -- Actions, OMLT, etc.
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS benchmark_index TEXT;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS subscription_fee DECIMAL(5, 2);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS redemption_fee DECIMAL(5, 2);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS nav DECIMAL(15, 2); -- Valeur Liquidative
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_1d DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_1w DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_1m DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_3m DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_6m DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_1y DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_2y DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_3y DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS perf_5y DECIMAL(10, 4);
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS depositary TEXT;
ALTER TABLE public.funds ADD COLUMN IF NOT EXISTS distributor TEXT;

-- Rename current_value to be more explicit (now we have nav)
ALTER TABLE public.funds RENAME COLUMN current_value TO asset_value;

-- Make code nullable since we have isin_code and morocco_code
ALTER TABLE public.funds ALTER COLUMN code DROP NOT NULL;

-- Add unique constraint on isin_code
CREATE UNIQUE INDEX IF NOT EXISTS idx_funds_isin_code ON public.funds(isin_code);
