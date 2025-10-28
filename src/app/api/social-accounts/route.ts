import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const accounts = await db.getSocialAccountsByUserId(session.user.id)
    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Social accounts fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social accounts' },
      { status: 500 }
    )
  }
}