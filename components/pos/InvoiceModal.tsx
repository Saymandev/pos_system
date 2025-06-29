'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { formatPrice } from '@/lib/utils'
import { PrinterIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef } from 'react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  subtotal: number
  item: {
    id: string
    name: string
    price: number
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  paymentType: 'CASH' | 'CARD' | 'DUE'
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
  createdAt: string
  user: {
    id: string
    name: string
  }
  orderItems: OrderItem[]
}

interface InvoiceModalProps {
  order: Order
  onClose: () => void
  autoPrint?: boolean
}

const PrintableInvoice = ({ order, settings }: { order: Order, settings: any }) => {
  return (
    <div className="bg-white p-6 max-w-sm mx-auto" style={{ width: '80mm', fontFamily: 'monospace' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
        <h1 className="text-lg font-bold">{settings?.restaurantName || 'Restaurant POS'}</h1>
        <div className="text-xs mt-1">
          <p>{settings?.address || '123 Main Street'}</p>
          <p>{settings?.city || 'New York'}, {settings?.state || 'NY'} {settings?.zipCode || '10001'}</p>
          <p>Tel: {settings?.phone || '(555) 123-4567'}</p>
          {settings?.email && <p>Email: {settings.email}</p>}
        </div>
      </div>

      {/* Order Info */}
      <div className="mb-4 text-xs">
        <div className="flex justify-between">
          <span>Order #:</span>
          <span className="font-bold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{new Date(order.createdAt).toLocaleTimeString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Staff:</span>
          <span>{order.user.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment:</span>
          <span>{order.paymentType}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-dashed border-gray-400 pt-2 mb-4">
        <div className="text-xs">
          {order.orderItems.map((orderItem) => (
            <div key={orderItem.id} className="mb-2">
              <div className="flex justify-between">
                <span className="flex-1">{orderItem.item.name}</span>
                <span>{formatPrice(orderItem.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 ml-2">
                <span>{orderItem.quantity} x {formatPrice(orderItem.price)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-t border-dashed border-gray-400 pt-2 mb-4 text-xs">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax ({((order.tax / order.subtotal) * 100).toFixed(2)}%):</span>
          <span>{formatPrice(order.tax)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-gray-300">
          <span>TOTAL:</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="border-t border-dashed border-gray-400 pt-2 mb-4 text-xs">
          <p className="font-semibold">Notes:</p>
          <p className="text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs border-t border-dashed border-gray-400 pt-4">
        <p>Thank you for your business!</p>
        <p>Please come again</p>
        {settings?.website && (
          <p className="mt-1">{settings.website}</p>
        )}
        <p className="mt-2 text-gray-500">
          {new Date().toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default function InvoiceModal({ order, onClose, autoPrint = false }: InvoiceModalProps) {
  const { settings } = useSettings()
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (printRef.current) {
      // Add print styles temporarily to head
      const printStyles = document.createElement('style')
      printStyles.id = 'temp-print-styles'
      printStyles.innerHTML = `
        @media print {
          body * { visibility: hidden; }
          #print-content, #print-content * { visibility: visible; }
          #print-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            margin: 0; 
            padding: 20px; 
            font-family: 'Courier New', monospace; 
          }
        }
      `
      document.head.appendChild(printStyles)
      
      // Add temp ID to print content
      const originalId = printRef.current.id
      printRef.current.id = 'print-content'
      
      // Print
      window.print()
      
      // Clean up
      document.head.removeChild(printStyles)
      printRef.current.id = originalId
      
      if (autoPrint) {
        onClose()
      }
    }
  }

  // Auto print when modal opens if autoPrint is true
  useEffect(() => {
    if (autoPrint && settings) {
      const timer = setTimeout(() => {
        handlePrint()
      }, 500) // Small delay to ensure content is rendered
      return () => clearTimeout(timer)
    }
  }, [autoPrint, settings])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Preview */}
        <div className="p-4">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div ref={printRef}>
              <PrintableInvoice order={order} settings={settings} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <PrinterIcon className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>
    </div>
  )
} 