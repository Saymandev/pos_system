import { authenticateRequest, hashPassword } from '@/lib/auth'
import { db } from '@/lib/db'
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

    // Check if user has permission (Admin can update anyone, users can update themselves)
    if (auth.user.role !== 'ADMIN' && auth.user.id !== params.id) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const data = await request.json()
    const { name, email, password, role, isActive } = data

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (isActive !== undefined) updateData.isActive = isActive

    // Only admins can change roles
    if (role !== undefined) {
      if (auth.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Only admins can change user roles' }, { status: 403 })
      }
      updateData.role = role
    }

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
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
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

    // Check if user has permission (Only admin can delete users)
    if (auth.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can delete users' }, { status: 403 })
    }

    // Prevent admins from deleting themselves
    if (auth.user.id === params.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

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
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
} 