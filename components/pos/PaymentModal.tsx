'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useSystemPreferences } from '@/lib/useSystemPreferences'
import { formatPrice } from '@/lib/utils'
import { BanknotesIcon, ClockIcon, CreditCardIcon, PercentBadgeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import InvoiceModal from './InvoiceModal'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount: number
  category: {
    name: string
    color: string
  }
}

interface Cart {
  items: CartItem[]
  subtotal: number
  tax: number
  orderDiscount: number
  orderDiscountAmount: number
  total: number
  processOrder: (paymentType: 'CASH' | 'CARD' | 'DUE', notes?: string) => Promise<any>
  updateItemDiscount: (id: string, discount: number) => void
  updateOrderDiscount: (discount: number) => void
  getItemSubtotal: (item: CartItem) => number
  getItemDiscountAmount: (item: CartItem) => number
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
  const [showDiscounts, setShowDiscounts] = useState(false)
  const { settings } = useSettings()
  const { shouldAutoPrint, showErrorNotification, showLoadingNotification, showSuccessNotification } = useSystemPreferences()

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      showLoadingNotification('Processing payment...', { id: 'payment' })
      
      const order = await cart.processOrder(paymentType, notes || undefined)
      setCompletedOrder(order)
      
      showSuccessNotification('Payment completed successfully!', { id: 'payment' })
      
      // Always show invoice after payment, but never auto-print
      setShowInvoice(true)
    } catch (error: any) {
      console.error('Payment failed:', error)
      showErrorNotification(error.message || 'Payment failed', { id: 'payment' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleItemDiscountChange = (itemId: string, discount: string) => {
    const numericDiscount = parseFloat(discount) || 0
    cart.updateItemDiscount(itemId, numericDiscount)
  }

  const handleOrderDiscountChange = (discount: string) => {
    const numericDiscount = parseFloat(discount) || 0
    cart.updateOrderDiscount(numericDiscount)
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

  const totalDiscountAmount = cart.items.reduce((sum, item) => sum + cart.getItemDiscountAmount(item), 0) + cart.orderDiscountAmount

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all">
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                <button
                  onClick={() => setShowDiscounts(!showDiscounts)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <PercentBadgeIcon className="w-4 h-4" />
                  <span>{showDiscounts ? 'Hide' : 'Add'} Discounts</span>
                </button>
              </div>
              
              {/* Items List */}
              <div className={`space-y-3 ${cart.items.length > 5 ? 'max-h-40 overflow-y-auto scrollbar-thin pr-2' : ''}`}>
                {cart.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex-1 truncate font-medium">{item.quantity}x {item.name}</span>
                      <div className="text-right">
                        {item.discount > 0 ? (
                          <div className="space-y-1">
                            <span className="text-gray-400 line-through text-xs">{formatPrice(item.price * item.quantity)}</span>
                            <span className="font-medium text-green-600">{formatPrice(cart.getItemSubtotal(item))}</span>
                          </div>
                        ) : (
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Individual Item Discount */}
                    {showDiscounts && (
                      <div className="flex items-center space-x-2 ml-4">
                        <label className="text-xs text-gray-600 w-16">Discount:</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.discount || ''}
                            onChange={(e) => handleItemDiscountChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                          />
                          <span className="text-xs text-gray-500">%</span>
                          {item.discount > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              (-{formatPrice(cart.getItemDiscountAmount(item))})
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Order-Level Discount */}
              {showDiscounts && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-gray-700">Order Discount:</label>
                    
                    {/* Quick Discount Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[5, 10, 15, 20, 25].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => handleOrderDiscountChange(percentage.toString())}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            cart.orderDiscount === percentage
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {percentage}% OFF
                        </button>
                      ))}
                      <button
                        onClick={() => handleOrderDiscountChange('0')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          cart.orderDiscount === 0
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Remove
                      </button>
                    </div>
                    
                    {/* Custom Discount Input */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600 w-16">Custom:</label>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={cart.orderDiscount || ''}
                          onChange={(e) => handleOrderDiscountChange(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">%</span>
                        {cart.orderDiscount > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            (-{formatPrice(cart.orderDiscountAmount)})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Totals */}
              <div className="border-t border-gray-200 mt-4 pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                {totalDiscountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Total Discounts:</span>
                    <span>-{formatPrice(totalDiscountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatPrice(cart.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-300">
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
            Receipt will be available after payment completion. Click Print Invoice to print.
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
          autoPrint={false}
        />
      )}
    </div>
  )
} 