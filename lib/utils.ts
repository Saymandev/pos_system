import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency symbols mapping
const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  BDT: '৳',
}

// Global currency setting - will be updated by settings context
let globalCurrency = 'USD'

export function setGlobalCurrency(currency: string) {
  globalCurrency = currency
}

export function formatPrice(price: number, currency?: string): string {
  const useCurrency = currency || globalCurrency
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: useCurrency,
    }).format(price)
  } catch (error) {
    // Fallback for unsupported currencies
    const symbol = currencySymbols[useCurrency] || useCurrency
    return `${symbol}${price.toFixed(2)}`
  }
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `ORD-${timestamp}-${randomStr}`.toUpperCase()
}

export function calculateTax(amount: number, taxRate: number = 0.08875): number {
  return amount * taxRate
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
} 