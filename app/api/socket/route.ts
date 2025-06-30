import { Server as NetServer } from 'http'
import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'

// Extend the global object to store the socket server
declare global {
  var io: SocketIOServer | undefined
}

const SocketHandler = (req: NextRequest, res: any) => {
  if (!global.io) {
    console.log('Setting up Socket.IO server...')
    
    // Create HTTP server for Socket.IO
    const httpServer: NetServer = res.socket.server as any
    global.io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXTAUTH_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    global.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join', (userId: string) => {
        console.log(`User ${userId} joined with socket ${socket.id}`)
        socket.join(`user-${userId}`)
        socket.join('pos-users') // Join general POS users room
        socket.broadcast.emit('userConnected', userId)
      })

      socket.on('leave', (userId: string) => {
        console.log(`User ${userId} left`)
        socket.leave(`user-${userId}`)
        socket.broadcast.emit('userDisconnected', userId)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  res.end()
}

export { SocketHandler as GET, SocketHandler as POST }

