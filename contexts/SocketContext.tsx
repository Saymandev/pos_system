'use client'

import { disconnectSocket, initSocket } from '@/lib/socket'
import React, { createContext, useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: () => void
  disconnect: () => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user } = useAuth()

  const connect = () => {
    if (!socket && user) {
      const newSocket = initSocket(user.id)
      setSocket(newSocket)
      
      newSocket.connect()
      
      newSocket.on('connect', () => {
        setIsConnected(true)
        toast.success('Connected to live updates', { 
          duration: 2000,
          icon: '🔄',
        })
      })
      
      newSocket.on('disconnect', () => {
        setIsConnected(false)
        toast.error('Disconnected from live updates', {
          duration: 2000,
          icon: '⚠️',
        })
      })

      newSocket.on('connect_error', () => {
        setIsConnected(false)
        toast.error('Failed to connect to live updates')
      })
    }
  }

  const disconnect = () => {
    if (socket) {
      disconnectSocket()
      setSocket(null)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    if (user && !socket) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user])

  return (
    <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
      {children}
    </SocketContext.Provider>
  )
} 