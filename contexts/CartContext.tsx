'use client'

import { createContext, ReactNode, useContext, useEffect, useReducer } from 'react'
import { useAuth } from './AuthContext'
import { useSettings } from './SettingsContext'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  discount: number // Individual item discount (percentage)
  category: {
    name: string
    color: string
  }
}

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  orderDiscount: number // Total order discount (percentage)
  orderDiscountAmount: number // Calculated discount amount
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity' | 'discount'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'UPDATE_ITEM_DISCOUNT'; payload: { id: string; discount: number } }
  | { type: 'UPDATE_ORDER_DISCOUNT'; payload: number }
  | { type: 'UPDATE_TAX_RATE'; payload: number }
  | { type: 'CLEAR_CART' }

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity' | 'discount'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemDiscount: (id: string, discount: number) => void
  updateOrderDiscount: (discount: number) => void
  clearCart: () => void
  processOrder: (paymentType: 'CASH' | 'CARD' | 'DUE', notes?: string) => Promise<any>
  getItemSubtotal: (item: CartItem) => number
  getItemDiscountAmount: (item: CartItem) => number
}

const calculateItemSubtotal = (item: CartItem): number => {
  const baseAmount = item.price * item.quantity
  const discountAmount = baseAmount * (item.discount / 100)
  return baseAmount - discountAmount
}

const calculateItemDiscountAmount = (item: CartItem): number => {
  const baseAmount = item.price * item.quantity
  return baseAmount * (item.discount / 100)
}

const cartReducer = (state: CartState, action: CartAction, taxRate: number = 0): CartState => {
  let newItems: CartItem[]
  let subtotal: number
  let tax: number
  let orderDiscountAmount: number
  let total: number
  let newOrderDiscount = state.orderDiscount

  switch (action.type) {
    case 'ADD_ITEM':
      const existingItem = state.items.find(item => item.id === action.payload.id)
      
      if (existingItem) {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newItems = [...state.items, { ...action.payload, quantity: 1, discount: 0 }]
      }
      break

    case 'REMOVE_ITEM':
      newItems = state.items.filter(item => item.id !== action.payload)
      break

    case 'UPDATE_QUANTITY':
      if (action.payload.quantity <= 0) {
        newItems = state.items.filter(item => item.id !== action.payload.id)
      } else {
        newItems = state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      }
      break

    case 'UPDATE_ITEM_DISCOUNT':
      newItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, discount: Math.max(0, Math.min(100, action.payload.discount)) }
          : item
      )
      break

    case 'UPDATE_ORDER_DISCOUNT':
      newItems = state.items
      newOrderDiscount = Math.max(0, Math.min(100, action.payload))
      break

    case 'UPDATE_TAX_RATE':
      newItems = state.items
      break

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        orderDiscount: 0,
        orderDiscountAmount: 0,
        total: 0,
      }

    default:
      return state
  }

  // Recalculate totals using dynamic tax rate
  // First calculate subtotal with individual item discounts
  subtotal = newItems.reduce((sum, item) => sum + calculateItemSubtotal(item), 0)
  
  // Apply order-level discount to subtotal
  orderDiscountAmount = subtotal * (newOrderDiscount / 100)
  const discountedSubtotal = subtotal - orderDiscountAmount
  
  // Calculate tax on discounted subtotal using dynamic tax rate
  tax = discountedSubtotal * (taxRate / 100)
  total = discountedSubtotal + tax
  
  return {
    items: newItems,
    subtotal,
    tax,
    orderDiscount: newOrderDiscount,
    orderDiscountAmount,
    total,
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  const { user } = useAuth()
  
  const [state, dispatch] = useReducer(
    (state: CartState, action: CartAction) => cartReducer(state, action, settings?.taxRate || 0),
    {
      items: [],
      subtotal: 0,
      tax: 0,
      orderDiscount: 0,
      orderDiscountAmount: 0,
      total: 0,
    }
  )

  // Update calculations when tax rate changes in settings
  useEffect(() => {
    if (settings && state.items.length > 0) {
      dispatch({ type: 'UPDATE_TAX_RATE', payload: settings.taxRate })
    }
  }, [settings?.taxRate, state.items.length])

  const addItem = (item: Omit<CartItem, 'quantity' | 'discount'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const updateItemDiscount = (id: string, discount: number) => {
    dispatch({ type: 'UPDATE_ITEM_DISCOUNT', payload: { id, discount } })
  }

  const updateOrderDiscount = (discount: number) => {
    dispatch({ type: 'UPDATE_ORDER_DISCOUNT', payload: discount })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const getItemSubtotal = (item: CartItem): number => {
    return calculateItemSubtotal(item)
  }

  const getItemDiscountAmount = (item: CartItem): number => {
    return calculateItemDiscountAmount(item)
  }

  const processOrder = async (paymentType: 'CASH' | 'CARD' | 'DUE', notes?: string) => {
    if (state.items.length === 0) {
      throw new Error('Cart is empty')
    }

    if (!user) {
      throw new Error('User must be authenticated to place orders')
    }

    const orderData = {
      items: state.items.map(item => ({
        itemId: item.id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount, // Include individual item discount
      })),
      paymentType,
      subtotal: state.subtotal,
      tax: state.tax,
      discount: state.orderDiscountAmount, // Total discount amount applied
      total: state.total,
      notes,
      userId: user.id,
    }

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to process order')
    }

    const order = await response.json()
    clearCart()
    return order
  }

  return (
    <CartContext.Provider value={{
      ...state,
      addItem,
      removeItem,
      updateQuantity,
      updateItemDiscount,
      updateOrderDiscount,
      clearCart,
      processOrder,
      getItemSubtotal,
      getItemDiscountAmount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
} 
 