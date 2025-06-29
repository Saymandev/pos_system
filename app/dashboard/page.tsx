'use client'

import DashboardLayout from '@/components/ui/DashboardLayout'
import { formatDate, formatPrice } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface DashboardData {
  totalOrders: number
  totalSales: number
  totalItems: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
    user: { name: string }
    orderItems: Array<{
      quantity: number
      item: { name: string }
    }>
  }>
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersResponse, statsResponse] = await Promise.all([
          fetch('/api/orders?limit=5'),
          fetch('/api/dashboard/stats')
        ])

        // Handle authentication errors
        if (!ordersResponse.ok || !statsResponse.ok) {
          if (ordersResponse.status === 401 || statsResponse.status === 401) {
            setError('Authentication required')
            return
          }
          throw new Error('Failed to fetch dashboard data')
        }

        const ordersData = await ordersResponse.json()
        const statsData = await statsResponse.json()

        setData({
          totalOrders: statsData.totalOrders || 0,
          totalSales: statsData.totalSales || 0,
          totalItems: statsData.totalItems || 0,
          recentOrders: ordersData.orders || []
        })
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        setError('Failed to load dashboard data')
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Header Skeleton */}
          <div className="px-4 sm:px-0">
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-64 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
            {/* Total Orders Card */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center">
                <div className="p-2 md:p-3 rounded-full bg-blue-100 w-12 h-12 md:w-14 md:h-14"></div>
                <div className="ml-3 md:ml-4 flex-1">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Total Sales Card */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow animate-pulse">
              <div className="flex items-center">
                <div className="p-2 md:p-3 rounded-full bg-green-100 w-12 h-12 md:w-14 md:h-14"></div>
                <div className="ml-3 md:ml-4 flex-1">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Total Items Card */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1 animate-pulse">
              <div className="flex items-center">
                <div className="p-2 md:p-3 rounded-full bg-purple-100 w-12 h-12 md:w-14 md:h-14"></div>
                <div className="ml-3 md:ml-4 flex-1">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table Skeleton */}
          <div className="bg-white shadow rounded-lg mx-4 sm:mx-0 animate-pulse">
            {/* Table Header */}
            <div className="px-4 md:px-6 py-4 border-b border-gray-200">
              <div className="w-28 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Order', 'Staff', 'Items', 'Total', 'Date', 'Status'].map((header, i) => (
                      <th key={i} className="px-4 md:px-6 py-3 text-left">
                        <div className="w-12 h-3 bg-gray-300 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from({ length: 5 }, (_, i) => (
                    <tr key={i}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Loading Text Overlay */}
          <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-50">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading dashboard...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        <div className="px-4 sm:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your restaurant's performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4 sm:px-0">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-full bg-blue-100">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{data?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-full bg-green-100">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{formatPrice(data?.totalSales || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-2 md:p-3 rounded-full bg-purple-100">
                <svg className="h-5 w-5 md:h-6 md:w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-xl md:text-2xl font-bold text-gray-900">{data?.totalItems || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg mx-4 sm:mx-0">
          <div className="px-4 md:px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.user.name}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.orderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(new Date(order.createdAt))}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-500">Orders will appear here once they are placed</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
} 