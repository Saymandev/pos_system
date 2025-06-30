import { authenticateRequest, authorizeRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { emitToPosUsers } from '@/lib/socketEmitter'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  image: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  isAvailable: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    // Get pagination and filter parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const isAvailable = searchParams.get('isAvailable')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const getAllItems = searchParams.get('getAllItems') === 'true' // For POS system

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true'
    }

    // Build orderBy clause
    const orderBy: any = {}
    if (sortBy === 'category') {
      orderBy.category = { name: sortOrder }
    } else {
      orderBy[sortBy] = sortOrder
    }

    if (getAllItems) {
      // For POS system - return ALL items without pagination
      const items = await db.item.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy,
      })

      return NextResponse.json({
        items,
        pagination: {
          page: 1,
          limit: items.length,
          total: items.length,
          pages: 1,
        },
      })
    } else {
      // Regular paginated response for management pages
      const [items, total] = await Promise.all([
        db.item.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
        db.item.count({ where }),
      ])

      return NextResponse.json({
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      })
    }
  } catch (error) {
    console.error('Error fetching items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    // Check if user has permission (Admin or Manager can create items)
    if (!authorizeRole(auth.user.role, ['ADMIN', 'MANAGER'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, price, categoryId, image, isAvailable } = await request.json()

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: 'Name, price, and category are required' }, { status: 400 })
    }

    const item = await db.item.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        categoryId,
        image,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    })

    // Emit real-time event for new item
    emitToPosUsers('itemUpdated', item)

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
} 