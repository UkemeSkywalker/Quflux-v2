'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.string().optional(),
  occupation: z.string().optional()
})

type ProfileFormData = z.infer<typeof profileSchema>

interface User {
  id: string
  email: string
  name: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  useEffect(() => {
    // Get user info
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user)
          const nameParts = data.user.name?.split(' ') || ['', '']
          setValue('firstName', nameParts[0] || '')
          setValue('lastName', nameParts.slice(1).join(' ') || '')
          setValue('email', data.user.email || '')
        }
      })
      .catch(console.error)
  }, [setValue])

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          age: data.age && data.age !== '' ? parseInt(data.age) : undefined,
          occupation: data.occupation && data.occupation !== '' ? data.occupation : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // Update local user state
      setUser({
        ...user!,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email
      })

      setMessage('Profile updated successfully!')
    } catch (error) {
      console.error('Profile update error:', error)
      setMessage('Failed to update profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-xl font-medium text-gray-600">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Profile Information</h2>
            <p className="text-lg font-medium text-gray-600">
              Update your personal information and account details
            </p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="firstName" className="text-lg font-bold text-gray-700">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  className="h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600 font-medium">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="lastName" className="text-lg font-bold text-gray-700">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  className="h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600 font-medium">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="email" className="text-lg font-bold text-gray-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                className="h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="age" className="text-lg font-bold text-gray-700">Age (Optional)</Label>
                <Input
                  id="age"
                  type="number"
                  min="13"
                  max="120"
                  className="h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  {...register('age')}
                />
                {errors.age && (
                  <p className="text-sm text-red-600 font-medium">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="occupation" className="text-lg font-bold text-gray-700">Occupation (Optional)</Label>
                <Input
                  id="occupation"
                  type="text"
                  className="h-14 text-xl font-semibold border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  {...register('occupation')}
                />
                {errors.occupation && (
                  <p className="text-sm text-red-600 font-medium">{errors.occupation.message}</p>
                )}
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl border-2 ${message.includes('success') ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                <p className="text-lg font-semibold">{message}</p>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="h-14 px-8 text-lg font-bold bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Account Security</h2>
            <p className="text-lg font-medium text-gray-600">
              Manage your password and security settings
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-bold text-gray-700">Password</Label>
              <p className="text-base font-medium text-gray-600 mt-2 mb-4">
                Your password was last updated on your account creation date.
              </p>
              <Button variant="outline" className="h-12 px-6 text-lg font-semibold rounded-xl">
                Change Password
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-red-200 p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-red-600 mb-3">Danger Zone</h2>
            <p className="text-lg font-medium text-gray-600">
              Irreversible and destructive actions
            </p>
          </div>
          
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-bold text-red-600">Delete Account</Label>
              <p className="text-base font-medium text-gray-600 mt-2 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button variant="destructive" className="h-12 px-6 text-lg font-semibold rounded-xl">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}