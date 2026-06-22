import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/hospitals', '/settings']
const AUTH_PATHS = ['/login', '/register', '/forgot-password']
const API_PREFIXES = ['/api/']

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 60
const ipMap = new Map<string, { count: number; resetAt: number }>()

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isApiRoute = API_PREFIXES.some((p) => pathname.startsWith(p))

  // Rate limiting for API routes (in-memory, per process)
  if (isApiRoute) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1'
    const now = Date.now()
    const entry = ipMap.get(ip)

    if (entry && now < entry.resetAt) {
      entry.count++
      if (entry.count > RATE_LIMIT_MAX) {
        return NextResponse.json(
          { error: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
          { status: 429, headers: { 'Retry-After': String(Math.ceil((entry.resetAt - now) / 1000)) } }
        )
      }
    } else {
      ipMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options ?? {})
          )
        },
      },
    }
  )

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPath  = AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (isProtected || isAuthPath) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
      }

      if (user && isAuthPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    } catch {
      if (isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
