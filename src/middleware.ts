import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret')

export async function middleware(request: NextRequest) {
  // Check if the request is for a protected route
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    try {
      // Verify the JWT token
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch (error) {
      // Token is invalid, redirect to login
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/posts/:path*', '/api/analytics/:path*']
}