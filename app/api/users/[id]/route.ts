import { hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { name, email, password, role, isActive } = data

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) updateData.isActive = isActive

    // Only hash password if it's provided
    if (password) {
      updateData.password = await hashPassword(password)
    }

    // Check if email already exists (excluding current user)
    if (email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: email.toLowerCase(),
          NOT: { id: params.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 400 }
        )
      }
    }

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    // Remove password from response
    const { password: _, ...safeUser } = user

    return NextResponse.json(safeUser)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user has any orders
    const orderCount = await db.order.count({
      where: { userId: params.id },
    })

    if (orderCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete user with existing orders. Deactivate instead.' },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 