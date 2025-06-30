import { Server as SocketIOServer } from 'socket.io'

declare global {
  var io: SocketIOServer | undefined
}

export const emitToAll = (event: string, data: any) => {
  if (global.io) {
    global.io.emit(event, data)
  }
}

export const emitToRoom = (room: string, event: string, data: any) => {
  if (global.io) {
    global.io.to(room).emit(event, data)
  }
}

export const emitToUser = (userId: string, event: string, data: any) => {
  if (global.io) {
    global.io.to(`user-${userId}`).emit(event, data)
  }
}

export const emitToPosUsers = (event: string, data: any) => {
  if (global.io) {
    global.io.to('pos-users').emit(event, data)
  }
}

export const getSocketServer = (): SocketIOServer | null => {
  return global.io || null
} 