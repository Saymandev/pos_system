import { authenticateRequest, authorizeRole } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteImageFile } from '@/lib/imageUtils'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    // Check if user has permission (Admin or Manager can update items)
    if (!authorizeRole(auth.user.role, ['ADMIN', 'MANAGER'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    const { name, description, price, categoryId, image, isAvailable } = data

    // Get the current item to check for image changes
    const currentItem = await db.item.findUnique({
      where: { id: params.id },
      select: { image: true }
    })

    if (!currentItem) {
      return NextResponse.json(
        { 
          error: 'Item not found',
          details: {
            message: 'This item no longer exists in the system. It may have been deleted by another user while you were viewing this page.',
            itemId: params.id,
            actionTaken: 'The item cannot be updated.',
            suggestion: 'Please refresh the page to see the current items list.'
          }
        },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = parseFloat(price)
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (image !== undefined) updateData.image = image
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable

    // Check if image is being changed and delete old image if necessary
    if (image !== undefined && currentItem.image && currentItem.image !== image) {
      // Delete the old image file
      try {
        await deleteImageFile(currentItem.image)
      } catch (error) {
        console.error('Failed to delete old image:', error)
        // Continue with update even if image deletion fails
      }
    }

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
    console.error('Update item error:', error)
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const auth = await authenticateRequest(request)
    if (auth.error || !auth.user) {
      return NextResponse.json({ error: auth.error || 'Authentication failed' }, { status: auth.status })
    }

    // Check if user has permission (Admin or Manager can delete items)
    if (!authorizeRole(auth.user.role, ['ADMIN', 'MANAGER'])) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const force = searchParams.get('force') === 'true'
    const deactivateOnly = searchParams.get('deactivate') === 'true'

    // Check if item is used in any orders
    const orderCount = await db.orderItem.count({
      where: { itemId: params.id },
    })

    // Get the item first to access its details
    const item = await db.item.findUnique({
      where: { id: params.id },
      select: { 
        id: true,
        name: true, 
        image: true, 
        isAvailable: true 
      }
    })

    if (!item) {
      return NextResponse.json(
        { 
          error: 'Item not found',
          details: {
            message: 'This item no longer exists in the system. It may have been deleted by another user while you were viewing this page.',
            itemId: params.id,
            actionTaken: 'The item has been removed from your current view.',
            suggestion: 'No action needed - the item list has been automatically updated.'
          }
        },
        { status: 404 }
      )
    }

    // If item has been ordered and force deletion is not requested
    if (orderCount > 0 && !force) {
      if (deactivateOnly) {
        // Just mark as unavailable instead of deleting
        const updatedItem = await db.item.update({
          where: { id: params.id },
          data: { isAvailable: false },
          include: {
            category: {
              select: { id: true, name: true, color: true }
            }
          }
        })
        
        return NextResponse.json({ 
          message: 'Item deactivated successfully (item has order history)',
          item: updatedItem,
          action: 'deactivated'
        })
      } else {
        return NextResponse.json(
          { 
            error: 'Cannot delete item that has been ordered',
            details: {
              itemName: item.name,
              orderCount: orderCount,
              suggestions: [
                'Use ?deactivate=true to mark as unavailable instead',
                'Use ?force=true to force delete (will affect order history)',
                'Consider keeping the item but marking it unavailable'
              ]
            }
          },
          { status: 400 }
        )
      }
    }

    // Proceed with deletion (either no orders exist or force deletion requested)
    await db.item.delete({
      where: { id: params.id },
    })

    // Delete the associated image file if it exists
    if (item.image) {
      try {
        await deleteImageFile(item.image)
        console.log(`Successfully deleted image for item: ${item.name}`)
      } catch (imageError) {
        // Log the error but don't fail the entire operation
        console.error('Failed to delete image file:', imageError)
        // The item was successfully deleted from database, so we continue
      }
    }

    const message = orderCount > 0 
      ? `Item and associated image force deleted (had ${orderCount} order references)`
      : 'Item and associated image deleted successfully'

    return NextResponse.json({ 
      message,
      action: 'deleted',
      hadOrders: orderCount > 0
    })
  } catch (error) {
    console.error('Delete item error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
} 