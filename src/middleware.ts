import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public paths that don't satisfy the login requirement
  const publicPaths = ['/login', '/favicon.ico']
  
  // Check if the path is static resource or public path
  const isPublicPath = publicPaths.includes(pathname) || 
                       pathname.startsWith('/_next') || 
                       pathname.startsWith('/static') || 
                       pathname.startsWith('/api') // Optional: decide if API needs protection too

  // Check for session cookie
  const session = request.cookies.get('session')

  // If trying to access protected route without session
  if (!isPublicPath && !session) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If trying to access login page with session
  if (pathname === '/login' && session) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
