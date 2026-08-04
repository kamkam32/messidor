"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client Supabase navigateur (composants client : auth, capture leads). */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim()
  );
}
