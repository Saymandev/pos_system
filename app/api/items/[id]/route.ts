import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { name, description, price, categoryId, image, isAvailable } = data

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (image !== undefined) updateData.image = image
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    const item = await db.item.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(item)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Check if item is used in any orders
    const orderCount = await db.orderItem.count({
      where: { itemId: params.id },
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete item that has been ordered' },
        { status: 400 }
      )
    }

    await db.item.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
} 