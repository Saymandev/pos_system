import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'Authentication failed' },
        { status: auth.status }
      )
    }

    // Only allow admin and manager roles to download backups
    if (auth.user.role !== 'ADMIN' && auth.user.role !== 'MANAGER') {
      return NextResponse.json(
        { error: 'Insufficient permissions. Only Admin and Manager can download backups.' },
        { status: 403 }
      )
    }

    // Fetch all data for backup
    const [orders, items, categories, users, settings] = await Promise.all([
      // Orders with full details
      db.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true }
          },
          orderItems: {
            include: {
              item: {
                select: { id: true, name: true, price: true, description: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Items (products) with categories
      db.item.findMany({
        include: {
          category: {
            select: { id: true, name: true, color: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Categories
      db.category.findMany({
        orderBy: { createdAt: 'desc' }
      }),

      // Users (without passwords)
      db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Settings
      db.settings.findFirst()
    ])

    // Calculate statistics
    const totalOrderValue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalItems = items.length
    const activeItems = items.filter(item => item.isAvailable).length
    const totalUsers = users.length
    const activeUsers = users.filter(user => user.isActive).length

    // Create backup data
    const backupData = {
      metadata: {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
        systemInfo: {
          totalOrders: orders.length,
          totalOrderValue: totalOrderValue,
          totalProducts: totalItems,
          activeProducts: activeItems,
          totalCategories: categories.length,
          totalUsers: totalUsers,
          activeUsers: activeUsers
        },
        generatedBy: {
          userId: auth.user.id,
          userName: auth.user.name,
          userRole: auth.user.role
        }
      },
      data: {
        orders: orders,
        products: items,
        categories: categories,
        users: users,
        settings: settings || {}
      }
    }

    return NextResponse.json(backupData)
  } catch (error) {
    console.error('Backup error:', error)
    return NextResponse.json(
      { error: 'Failed to generate backup' },
      { status: 500 }
    )
  }
} 