import { authenticateRequest } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateOrderNumber } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const orderItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
})

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  paymentType: z.enum(['CASH', 'CARD', 'DUE']),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0).default(0),
  total: z.number().min(0),
  notes: z.string().optional(),
  userId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}
    if (status) where.status = status
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true },
          },
          orderItems: {
            include: {
              item: {
                select: { id: true, name: true, price: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    const { items, paymentType, subtotal, tax, discount, total, notes, userId } = await request.json()

    // Ensure the user can only create orders for themselves (unless admin)
    if (auth.user.role !== 'ADMIN' && auth.user.id !== userId) {
      return NextResponse.json({ error: 'Can only create orders for yourself' }, { status: 403 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Order items are required' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        orderNumber,
        status: 'COMPLETED',
        paymentType,
        subtotal,
        tax,
        discount,
        total,
        notes,
        userId: userId || auth.user.id,
        orderItems: {
          create: items.map((item: any) => ({
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity,
          })),
        },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
        orderItems: {
          include: {
            item: {
              select: { id: true, name: true },
            },
          },
        },
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
} 