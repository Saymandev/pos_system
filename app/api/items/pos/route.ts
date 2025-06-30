import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get ALL items for POS system - no pagination, no limits
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
      orderBy: { name: 'asc' }, // Sort by name for POS
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching POS items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
} 