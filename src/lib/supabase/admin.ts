import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Client service-role — bypass RLS. Server-only.
 * Usage : cron sync OPCVM, insertion leads côté API. Jamais exposé au client.
 * Null si la clé n'est pas configurée (évite un crash au build).
 */
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

export const supabaseAdmin =
  url && serviceKey
    ? createClient(url, serviceKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;
