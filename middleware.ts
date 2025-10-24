import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes spécifiquement protégées (priorité haute - vérifiées en premier)
  const specificProtectedPaths = [
    '/dashboard/opcvm/comparateur', // Comparateur requiert auth
    '/dashboard/settings',
    '/dashboard/profile',
  ]

  const isSpecificProtected = specificProtectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Public routes (accessible without auth) - Important for SEO
  const publicPaths = [
    '/dashboard/opcvm',      // Liste des OPCVM et détails des fonds
    '/dashboard/bourse',     // Bourse
    '/dashboard/simulateur', // Simulateur
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Protected routes (require authentication) - catch-all
  const protectedPaths = ['/dashboard', '/portfolio']
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  // Redirect to login if:
  // 1. Path is specifically protected OR
  // 2. (Path is protected AND Path is NOT public) AND
  // 3. User is not authenticated
  const shouldProtect = isSpecificProtected || (isProtectedPath && !isPublicPath)

  if (shouldProtect && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
