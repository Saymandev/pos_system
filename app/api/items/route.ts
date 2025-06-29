import { authenticateRequest, authorizeRole } from '@/lib/auth'
import { db } from '@/lib/db'
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

export async function GET() {
  try {
    const items = await db.item.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
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

    const { name, description, price, categoryId, image, available } = await request.json()

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
        isAvailable: available !== undefined ? available : true,
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

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
  }
} 