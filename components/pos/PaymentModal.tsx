'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { formatPrice } from '@/lib/utils'
import { BanknotesIcon, ClockIcon, CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import InvoiceModal from './InvoiceModal'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: {
    name: string
    color: string
  }
}

interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  processOrder: (paymentType: 'CASH' | 'CARD' | 'DUE', notes?: string) => Promise<any>
}

interface PaymentModalProps {
  cart: Cart
  onClose: () => void
  onSuccess: () => void
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
  orderItems: Array<{
    id: string
    quantity: number
    price: number
    subtotal: number
    item: {
      id: string
      name: string
      price: number
    }
  }>
}

export default function PaymentModal({ cart, onClose, onSuccess }: PaymentModalProps) {
  const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'DUE'>('CASH')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)
  const { settings } = useSettings()

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const order = await cart.processOrder(paymentType, notes || undefined)
      setCompletedOrder(order)
      
      // Check if auto-print is enabled in settings
      if (settings?.printReceipts) {
        setShowInvoice(true)
      } else {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Payment failed:', error)
      alert('Payment failed: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const paymentOptions = [
    {
      type: 'CASH' as const,
      label: 'Cash',
      icon: BanknotesIcon,
      color: 'bg-green-500',
      description: 'Pay with cash'
    },
    {
      type: 'CARD' as const,
      label: 'Card',
      icon: CreditCardIcon,
      color: 'bg-blue-500',
      description: 'Credit/Debit card'
    },
    {
      type: 'DUE' as const,
      label: 'Pay Later',
      icon: ClockIcon,
      color: 'bg-orange-500',
      description: 'Add to customer tab'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 touch-scroll">
          <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
              
              {/* Scrollable items list if many items */}
              <div className={`space-y-2 ${cart.items.length > 5 ? 'max-h-32 overflow-y-auto scrollbar-thin pr-2' : ''}`}>
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="flex-1 truncate">{item.quantity}x {item.name}</span>
                    <span className="font-medium ml-2">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(cart.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
              <div className="space-y-2">
                {paymentOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setPaymentType(option.type)}
                    className={`w-full p-4 rounded-xl border transition-all duration-200 flex items-center space-x-3 ${
                      paymentType === option.type
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${option.color} text-white`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentType === option.type 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300'
                    }`}>
                      {paymentType === option.type && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Special instructions or notes..."
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer with Action Buttons */}
        <div className="border-t border-gray-200 p-6 flex-shrink-0">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Complete Payment • ${formatPrice(cart.total)}`
              )}
            </button>
          </div>
          
          {/* Receipt Preview */}
          <p className="text-sm text-gray-600 text-center mt-4">
            {settings?.printReceipts ? 
              'Receipt will be printed automatically after payment' : 
              'Receipt will be available after payment completion'
            }
          </p>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && completedOrder && (
        <InvoiceModal
          order={completedOrder}
          onClose={() => {
            setShowInvoice(false)
            onSuccess()
          }}
          autoPrint={settings?.printReceipts || false}
        />
      )}
    </div>
  )
} 