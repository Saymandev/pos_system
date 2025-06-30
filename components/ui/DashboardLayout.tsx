'use client'

import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import Navigation from './Navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Allow access to login page without authentication
    const publicRoutes = ['/login']
    const isPublicRoute = publicRoutes.includes(pathname)

    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router, pathname])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span className="text-gray-600 font-medium text-lg">Loading...</span>
        </div>
      </div>
    )
  }

  // Allow login page to render without authentication
  const publicRoutes = ['/login']
  const isPublicRoute = publicRoutes.includes(pathname)

  if (!isAuthenticated && !isPublicRoute) {
    return null // This will trigger the redirect in useEffect
  }

  // If user is authenticated but on login page, redirect to dashboard
  if (isAuthenticated && pathname === '/login') {
    router.push('/dashboard')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="lg:ml-64">
        <div className="min-h-screen">
          {children}
        </div>
      </main>
      
    </div>
  )
} 