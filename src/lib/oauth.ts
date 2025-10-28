import { db } from './database'

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string
  authUrl: string
  tokenUrl: string
}

export interface OAuthTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
}

export interface PlatformUserInfo {
  id: string
  username: string
  name?: string
}

export class OAuthService {
  private configs: Record<string, OAuthConfig> = {
    x: {
      clientId: process.env.TWITTER_CLIENT_ID || 'placeholder',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || 'placeholder',
      redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/x`,
      scope: 'tweet.read tweet.write users.read offline.access',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token'
    },
    instagram: {
      clientId: process.env.INSTAGRAM_CLIENT_ID || 'placeholder',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || 'placeholder',
      redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/instagram`,
      scope: 'user_profile,user_media',
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token'
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID || 'placeholder',
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'placeholder',
      redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/linkedin`,
      scope: 'r_liteprofile r_emailaddress w_member_social',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || 'placeholder',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'placeholder',
      redirectUri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/callback/facebook`,
      scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token'
    }
  }

  getAuthUrl(platform: string, state: string): string {
    const config = this.configs[platform]
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      response_type: 'code',
      state
    })

    return `${config.authUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(platform: string, code: string): Promise<OAuthTokenResponse> {
    const config = this.configs[platform]
    if (!config) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    const response = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
        code
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }

    return response.json()
  }

  async getUserInfo(platform: string, accessToken: string): Promise<PlatformUserInfo> {
    switch (platform) {
      case 'x':
        return this.getTwitterUserInfo(accessToken)
      case 'instagram':
        return this.getInstagramUserInfo(accessToken)
      case 'linkedin':
        return this.getLinkedInUserInfo(accessToken)
      case 'facebook':
        return this.getFacebookUserInfo(accessToken)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  private async getTwitterUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const response = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Twitter user info')
    }

    const data = await response.json()
    return {
      id: data.data.id,
      username: data.data.username,
      name: data.data.name
    }
  }

  private async getInstagramUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const response = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`)

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram user info')
    }

    const data = await response.json()
    return {
      id: data.id,
      username: data.username
    }
  }

  private async getLinkedInUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const response = await fetch('https://api.linkedin.com/v2/people/~:(id,localizedFirstName,localizedLastName)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch LinkedIn user info')
    }

    const data = await response.json()
    return {
      id: data.id,
      username: data.id, // LinkedIn doesn't have usernames like other platforms
      name: `${data.localizedFirstName} ${data.localizedLastName}`
    }
  }

  private async getFacebookUserInfo(accessToken: string): Promise<PlatformUserInfo> {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`)

    if (!response.ok) {
      throw new Error('Failed to fetch Facebook user info')
    }

    const data = await response.json()
    return {
      id: data.id,
      username: data.name, // Facebook uses name as display identifier
      name: data.name
    }
  }

  async saveConnection(
    userId: string,
    platform: string,
    tokenResponse: OAuthTokenResponse,
    userInfo: PlatformUserInfo
  ) {
    const expiresAt = tokenResponse.expires_in 
      ? new Date(Date.now() + tokenResponse.expires_in * 1000).toISOString()
      : undefined

    await db.createSocialAccount({
      user_id: userId,
      platform: platform as any,
      platform_user_id: userInfo.id,
      username: userInfo.username,
      access_token: tokenResponse.access_token,
      refresh_token: tokenResponse.refresh_token,
      token_expires_at: expiresAt,
      is_active: true
    })
  }
}

export const oauthService = new OAuthService()