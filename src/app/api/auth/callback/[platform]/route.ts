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

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=oauth_error', request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=missing_parameters', request.url)
      )
    }

    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get('oauth_state')?.value
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/dashboard/accounts?error=invalid_state', request.url)
      )
    }

    // Clear state cookie
    cookieStore.delete('oauth_state')

    const { platform } = await params

    // Exchange code for token
    const tokenResponse = await oauthService.exchangeCodeForToken(platform, code)
    
    // Get user info from platform
    const userInfo = await oauthService.getUserInfo(platform, tokenResponse.access_token)
    
    // Save connection to database
    await oauthService.saveConnection(
      session.user.id,
      platform,
      tokenResponse,
      userInfo
    )

    return NextResponse.redirect(
      new URL('/dashboard/accounts?success=connected', request.url)
    )
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/accounts?error=connection_failed', request.url)
    )
  }
}