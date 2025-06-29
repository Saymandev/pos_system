'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const user = await response.json()
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      } catch (error) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const user = await response.json()
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      // Handle error silently
    } finally {
      // Clear all local state and storage
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      // Clear any cached data
      localStorage.clear()
      sessionStorage.clear()
      
      // Force page reload to ensure complete cleanup
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }

  const setUser = (user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user,
    }))
  }

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 