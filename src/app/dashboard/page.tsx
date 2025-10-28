'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Users, Calendar, BarChart3 } from 'lucide-react'

interface DashboardStats {
  postsCount: number
  scheduledCount: number
  connectedAccounts: number
}

interface User {
  id: string
  email: string
  name: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    postsCount: 0,
    scheduledCount: 0,
    connectedAccounts: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user info
        const userResponse = await fetch('/api/auth/me')
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUser(userData.user)
        }

        // Get stats
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
        </h1>
        <p className="text-xl text-gray-600 font-medium">
          Here&#39;s what&#39;s happening with your social media automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? '...' : stats.postsCount}
              </div>
              <div className="text-lg font-semibold text-gray-500">Total Posts</div>
            </div>
          </div>
          <p className="text-base font-medium text-gray-600">
            Posts created in your account
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? '...' : stats.scheduledCount}
              </div>
              <div className="text-lg font-semibold text-gray-500">Scheduled</div>
            </div>
          </div>
          <p className="text-base font-medium text-gray-600">
            Posts waiting to be published
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">
                {isLoading ? '...' : stats.connectedAccounts}
              </div>
              <div className="text-lg font-semibold text-gray-500">Connected</div>
            </div>
          </div>
          <p className="text-base font-medium text-gray-600">
            Social media accounts linked
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-lg font-medium text-gray-600">Get started with common tasks</p>
          </div>
          <div className="space-y-4">
            <Link href="/dashboard/posts/create">
              <Button className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-200 rounded-2xl h-16 text-lg font-bold" variant="outline">
                <Plus className="mr-4 h-6 w-6" />
                Create New Post
              </Button>
            </Link>
            <Link href="/dashboard/accounts">
              <Button className="w-full justify-start bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200 rounded-2xl h-16 text-lg font-bold" variant="outline">
                <Users className="mr-4 h-6 w-6" />
                Connect Social Account
              </Button>
            </Link>
            <Link href="/dashboard/schedule">
              <Button className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100 border-2 border-purple-200 rounded-2xl h-16 text-lg font-bold" variant="outline">
                <Calendar className="mr-4 h-6 w-6" />
                View Schedule
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h3>
            <p className="text-lg font-medium text-gray-600">Complete these steps to set up your automation</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.connectedAccounts > 0 
                  ? 'bg-green-100 text-green-600 border-3 border-green-200' 
                  : 'bg-gray-100 text-gray-500 border-3 border-gray-200'
              }`}>
                {stats.connectedAccounts > 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-lg font-bold">1</span>
                )}
              </div>
              <span className={`text-lg font-semibold ${stats.connectedAccounts > 0 ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                Connect your social media accounts
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-500 border-3 border-gray-200 flex items-center justify-center">
                <span className="text-lg font-bold">2</span>
              </div>
              <span className="text-lg font-semibold text-gray-700">Set up your brand profile</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                stats.postsCount > 0 
                  ? 'bg-green-100 text-green-600 border-3 border-green-200' 
                  : 'bg-gray-100 text-gray-500 border-3 border-gray-200'
              }`}>
                {stats.postsCount > 0 ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-lg font-bold">3</span>
                )}
              </div>
              <span className={`text-lg font-semibold ${stats.postsCount > 0 ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                Create your first post
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}