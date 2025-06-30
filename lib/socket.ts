import { io, Socket } from 'socket.io-client'

interface ServerToClientEvents {
  orderCreated: (order: any) => void
  orderStatusChanged: (orderId: string, status: string) => void
  itemUpdated: (item: any) => void
  itemAvailabilityChanged: (data: { itemId: string, isAvailable: boolean, item: any }) => void
  inventoryUpdated: (itemId: string, stock: number) => void
  dashboardStatsUpdated: (stats: any) => void
  settingsUpdated: (settings: any) => void
  categoryUpdated: (category: any) => void
  userConnected: (userId: string) => void
  userDisconnected: (userId: string) => void
}

interface ClientToServerEvents {
  join: (userId: string) => void
  leave: (userId: string) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export const initSocket = (userId?: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000', {
      autoConnect: false,
      transports: ['websocket', 'polling'], // Fallback transports
    })

    socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server')
      if (userId) {
        socket?.emit('join', userId)
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from Socket.IO server:', reason)
    })

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error)
    })
  }

  return socket
}

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const connectSocket = (userId?: string) => {
  if (socket && !socket.connected) {
    socket.connect()
    if (userId) {
      socket.emit('join', userId)
    }
  }
} 