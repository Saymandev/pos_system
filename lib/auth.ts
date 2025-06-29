import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { db } from './db'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  return db.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })
}

// Middleware function to authenticate API routes
export async function authenticateRequest(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return { error: 'No token provided', status: 401 }
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    })

    if (!user) {
      return { error: 'User not found', status: 401 }
    }

    return { user, status: 200 }
  } catch (error) {
    return { error: 'Invalid token', status: 401 }
  }
}

// Role-based authorization
export function authorizeRole(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole)
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  })
}

export async function createUser(email: string, name: string, password: string, role: 'ADMIN' | 'MANAGER' | 'STAFF' = 'STAFF') {
  const hashedPassword = await hashPassword(password)
  
  return db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role,
    },
  })
} 