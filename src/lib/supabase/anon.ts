import { createClient } from "@supabase/supabase-js";

/**
 * Client anon sans état — pour la lecture des données publiques (funds, perfs)
 * dans les Server Components. RLS s'applique (lecture publique autorisée).
 * Pas de session, donc pas de cookie -> les pages restent cacheables (SEO).
 */
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const supabaseAnon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
