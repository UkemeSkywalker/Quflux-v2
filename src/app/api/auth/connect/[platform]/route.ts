import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { oauthService } from '@/lib/oauth'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const { platform } = await params
    
    // Generate state parameter for security
    const state = `${session.user.id}:${platform}:${Date.now()}`
    
    // Store state in cookie for verification
    const cookieStore = await cookies()
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600 // 10 minutes
    })

    // Get authorization URL
    const authUrl = oauthService.getAuthUrl(platform, state)
    
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('OAuth initiation error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=connection_failed', request.url)
    )
  }
}