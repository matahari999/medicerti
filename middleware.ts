import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIXES = ['/dashboard', '/hospitals', '/settings']
const AUTH_PATHS = ['/login', '/register', '/forgot-password']
const API_PREFIXES = ['/api/']

const PROJECT_REF = 'oyivyltzugfzbozwxmew'

function getSession(request: NextRequest): boolean {
  // @supabase/ssr이 사용하는 쿠키 이름 패턴
  const cookieNames = [
    `sb-${PROJECT_REF}-auth-token`,
    `sb-${PROJECT_REF}-auth-token.0`,
  ]
  return cookieNames.some((name) => !!request.cookies.get(name))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isApiRoute   = API_PREFIXES.some((p)  => pathname.startsWith(p))
  const isProtected  = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPath   = AUTH_PATHS.some((p)        => pathname.startsWith(p))

  if (!isProtected && !isAuthPath && !isApiRoute) {
    return NextResponse.next()
  }

  const hasSession = getSession(request)

  if (!hasSession && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  if (hasSession && isAuthPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
