import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Middleware (Next 16 : proxy.ts).
 * - Rafraîchit la session Supabase UNIQUEMENT si un cookie sb-* est présent.
 *   Le trafic anonyme (99% + bots) court-circuite -> pages cacheables (SEO/CWV).
 * - Protège l'Espace Client : redirige vers la connexion si non authentifié.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isEspaceClient = pathname.startsWith("/espace-client");
  const isAuthPage =
    pathname.startsWith("/espace-client/connexion") ||
    pathname.startsWith("/espace-client/inscription") ||
    pathname.startsWith("/espace-client/reset");

  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  // Aucune session et page non protégée -> passe-plat (cacheable)
  if (!hasSessionCookie && !isEspaceClient) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim(),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Zone protégée sans user -> connexion
  if (isEspaceClient && !isAuthPage && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/espace-client/connexion";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Déjà connecté sur une page auth -> tableau de bord
  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/espace-client";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|xml|txt|webmanifest)$).*)"],
};
