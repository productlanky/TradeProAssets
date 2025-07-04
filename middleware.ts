import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = req.nextUrl.pathname.startsWith('/dashboard')

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/', req.url)) // redirect to landing
  }

  if (req.nextUrl.pathname === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
