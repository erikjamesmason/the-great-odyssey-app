import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/plans']
const publicPaths = ['/login', '/signup']

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname

  const isProtected = protectedPaths.some(p => path.startsWith(p))
  const isPublic = publicPaths.some(p => path.startsWith(p))

  // Optimistic check: look for the Supabase auth cookie without a network call.
  // Full token verification happens in each Server Component via createClient().auth.getUser().
  const hasSession = req.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'))

  if (isProtected && !hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (isPublic && hasSession) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
