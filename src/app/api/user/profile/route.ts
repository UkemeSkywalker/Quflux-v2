import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/database'
import { z } from 'zod'

const updateProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(13).max(120).optional(),
  occupation: z.string().min(2).optional()
})

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { firstName, lastName, email, age, occupation } = updateProfileSchema.parse(body)

    // Check if email is already taken by another user
    const existingUser = await db.getUserByEmail(email)
    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await db.updateUser(session.user.id, {
      first_name: firstName,
      last_name: lastName,
      email,
      age,
      occupation
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: `${updatedUser.first_name} ${updatedUser.last_name}`,
        email: updatedUser.email
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}