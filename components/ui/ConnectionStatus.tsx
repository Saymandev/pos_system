'use client'

import { useSocket } from '@/contexts/SocketContext'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function ConnectionStatus() {
  const { isConnected } = useSocket()

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`
        flex items-center space-x-3 px-4 py-3 rounded-full text-sm font-medium shadow-lg border transition-all duration-200
        ${isConnected 
          ? 'bg-green-50 text-green-800 border-green-200 shadow-green-100' 
          : 'bg-yellow-50 text-yellow-800 border-yellow-200 shadow-yellow-100'
        }
      `}>
        {isConnected ? (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            <span>Live Updates Active</span>
          </>
        ) : (
          <>
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Connecting...</span>
          </>
        )}
      </div>
    </div>
  )
} 