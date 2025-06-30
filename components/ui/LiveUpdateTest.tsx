'use client'

import { useSocket } from '@/contexts/SocketContext'
import { useEffect, useState } from 'react'

export default function LiveUpdateTest() {
  const { socket, isConnected } = useSocket()
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    if (!socket) return

    const handleOrderCreated = (order: any) => {
      setEvents(prev => [`🛎️ New order #${order.orderNumber} created - $${order.total}`, ...prev.slice(0, 4)])
    }

    const handleItemUpdated = (item: any) => {
      setEvents(prev => [`📦 Item "${item.name}" updated - ${item.isAvailable ? 'Available' : 'Unavailable'}`, ...prev.slice(0, 4)])
    }

    const handleSettingsUpdated = (settings: any) => {
      setEvents(prev => [`⚙️ Settings updated`, ...prev.slice(0, 4)])
    }

    socket.on('orderCreated', handleOrderCreated)
    socket.on('itemUpdated', handleItemUpdated)
    socket.on('settingsUpdated', handleSettingsUpdated)

    return () => {
      socket.off('orderCreated', handleOrderCreated)
      socket.off('itemUpdated', handleItemUpdated)
      socket.off('settingsUpdated', handleSettingsUpdated)
    }
  }, [socket])

  if (!isConnected) return null

  return (
    <div className="fixed bottom-20 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
      <div className="flex items-center space-x-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <h3 className="text-sm font-semibold text-gray-900">Live Updates</h3>
      </div>
      
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-gray-500">Waiting for live updates...</p>
        ) : (
          events.map((event, index) => (
            <div key={index} className="text-xs text-gray-700 p-2 bg-gray-50 rounded">
              {event}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 