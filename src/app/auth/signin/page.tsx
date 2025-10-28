import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex min-h-screen">
        {/* Left side - Image/Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6">
                Welcome Back to Your Social Media Command Center
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Continue managing your social media presence with powerful AI automation tools.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">10+</div>
                  <div className="text-blue-200 text-sm">Hours Saved Weekly</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">5x</div>
                  <div className="text-blue-200 text-sm">Better Engagement</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-100">Multi-platform publishing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-100">Smart content optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-100">Real-time performance tracking</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full opacity-20 -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 translate-y-48 -translate-x-48"></div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-2xl">
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">QuFlux</h1>
              <p className="text-gray-600 mt-2">AI-powered social media automation</p>
            </div>
            
            <LoginForm />
            
            <div className="mt-8 text-center">
              <p className="text-base text-gray-600">
                Don&#39;t have an account?{' '}
                <Link href="/auth/signup" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}