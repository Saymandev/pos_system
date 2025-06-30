const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : process.env.NEXTAUTH_URL,
      methods: ["GET", "POST"]
    }
  })

  // Store io instance globally to access from API routes
  global.io = io

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)

    socket.on('join', (userId) => {
      console.log(`👤 User ${userId} joined with socket ${socket.id}`)
      socket.join(`user-${userId}`)
      socket.join('pos-users') // Join general POS users room
      socket.broadcast.emit('userConnected', userId)
    })

    socket.on('leave', (userId) => {
      console.log(`👋 User ${userId} left`)
      socket.leave(`user-${userId}`)
      socket.broadcast.emit('userDisconnected', userId)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Client disconnected:', socket.id, 'Reason:', reason)
    })
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`🚀 Server ready on http://${hostname}:${port}`)
    console.log('🔄 Socket.IO server initialized')
  })
}) 