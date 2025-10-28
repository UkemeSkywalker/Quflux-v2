import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll()
  console.log('All cookies:', cookies)
  
  const authToken = request.cookies.get('auth-token')
  console.log('Auth token:', authToken)
  
  return NextResponse.json({
    cookies: cookies,
    authToken: authToken
  })
}

export async function POST() {
  const response = NextResponse.json({ message: 'Test cookie set' })
  
  response.cookies.set('test-cookie', 'test-value', {
    httpOnly: true,
    secure: false, // Always false for testing
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/'
  })
  
  return response
}