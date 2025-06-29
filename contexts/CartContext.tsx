'use client'

import { createContext, ReactNode, useContext, useReducer } from 'react'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  category: {
    name: string
    color: string
  }
}

interface CartState {
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

interface CartContextType extends CartState {
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  processOrder: (paymentType: 'CASH' | 'CARD' | 'DUE', notes?: string) => Promise<any>
}

const TAX_RATE = 0.08875 // 8.875% tax rate

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[]
  let subtotal: number
  let tax: number

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
        newItems = [...state.items, { ...action.payload, quantity: 1 }]
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

    case 'CLEAR_CART':
      return {
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
      }

    default:
      return state
  }

  // Recalculate totals
  subtotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  tax = subtotal * TAX_RATE
  
  return {
    items: newItems,
    subtotal,
    tax,
    total: subtotal + tax,
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  })
  const { user } = useAuth()

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
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
      })),
      paymentType,
      subtotal: state.subtotal,
      tax: state.tax,
      discount: 0,
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
      clearCart,
      processOrder,
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
 