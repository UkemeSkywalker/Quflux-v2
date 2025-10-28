import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { db } from '@/lib/database'

export async function GET() {
  try {
    const user = await requireAuth()

    // Fetch dashboard statistics
    const [posts, socialAccounts, scheduledJobs] = await Promise.all([
      db.getPostsByUserId(user.id),
      db.getSocialAccountsByUserId(user.id),
      db.getScheduledJobsByUserId(user.id)
    ])

    const stats = {
      postsCount: posts.length,
      connectedAccounts: socialAccounts.length,
      scheduledCount: scheduledJobs.filter(job => job.status === 'pending').length
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}