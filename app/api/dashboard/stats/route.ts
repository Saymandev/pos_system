import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    const [totalOrders, totalSales, totalItems] = await Promise.all([
      db.order.count(),
      db.order.aggregate({
        _sum: {
          total: true,
        },
      }),
      db.item.count({
        where: { isAvailable: true },
      }),
    ])

    return NextResponse.json({
      totalOrders,
      totalSales: totalSales._sum.total || 0,
      totalItems,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
} 