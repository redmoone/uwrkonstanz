import { NextResponse, type NextRequest } from 'next/server'
import { inferCookieOrigin } from './lib/http-cookie-origin'

export function middleware(request: NextRequest) {
  const origin = inferCookieOrigin(
    request.headers,
    request.method,
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  )
  if (!origin) return NextResponse.next()
  const headers = new Headers(request.headers)
  headers.set('origin', origin)
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}
