import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't need auth - Important for SEO
  const publicPaths = [
    '/dashboard/opcvm',      // Liste des OPCVM et détails des fonds (sauf comparateur)
    '/dashboard/bourse',     // Bourse
    '/dashboard/simulateur', // Simulateur
    '/blog',                 // Blog et articles
  ]

  // Specifically protected paths (require auth even inside public parents)
  const specificProtectedPaths = [
    '/dashboard/opcvm/comparateur',
    '/dashboard/settings',
    '/dashboard/profile',
  ]

  const isSpecificProtected = specificProtectedPaths.some(path =>
    pathname.startsWith(path)
  )

  const isPublicPath = !isSpecificProtected && publicPaths.some(path =>
    pathname.startsWith(path)
  )

  // Protected routes (require authentication)
  const protectedPaths = ['/dashboard', '/portfolio']
  const isProtectedPath = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // Early return: no Supabase call needed for public paths
  if (isPublicPath) {
    return NextResponse.next({ request })
  }

  // Only call Supabase for routes that actually need auth
  const needsAuthCheck = isSpecificProtected || isProtectedPath || isAuthPath
  if (!needsAuthCheck) {
    return NextResponse.next({ request })
  }

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
          cookiesToSet.forEach(({ name, value }) =>
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

  const shouldProtect = isSpecificProtected || (isProtectedPath && !isPublicPath)

  if (shouldProtect && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

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
