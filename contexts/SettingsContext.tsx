'use client'

import { setGlobalCurrency } from '@/lib/utils'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Settings {
  id?: string
  // Restaurant Information
  restaurantName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  website: string
  timezone: string
  
  // Tax Settings
  taxRate: number
  taxName: string
  includeTaxInPrice: boolean
  roundTax: boolean
  
  // System Preferences
  currency: string
  dateFormat: string
  timeFormat: string
  orderNumberPrefix: string
  enableNotifications: boolean
  autoBackup: boolean
  printReceipts: boolean
  requireConfirmation: boolean
  
  // Logo & Branding
  logo?: string
  companySlogan?: string
  primaryColor?: string
  secondaryColor?: string
  
  // Metadata
  createdAt?: string
  updatedAt?: string
}

interface SettingsContextType {
  settings: Settings | null
  isLoading: boolean
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>
  refreshSettings: () => Promise<void>
}

const defaultSettings: Settings = {
  restaurantName: 'Restaurant POS',
  address: '123 Main Street',
  city: 'New York',
  state: 'NY',
  zipCode: '10001',
  phone: '(555) 123-4567',
  email: 'info@restaurant.com',
  website: 'www.restaurant.com',
  timezone: 'America/New_York',
  taxRate: 8.875,
  taxName: 'Sales Tax',
  includeTaxInPrice: false,
  roundTax: true,
  currency: 'BDT',
  dateFormat: 'MM/dd/yyyy',
  timeFormat: '12h',
  orderNumberPrefix: 'ORD',
  enableNotifications: true,
  autoBackup: true,
  printReceipts: true,
  requireConfirmation: true,
  logo: '',
  companySlogan: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#6B7280',
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        // Update global currency whenever settings are loaded
        if (data.currency) {
          setGlobalCurrency(data.currency)
        }
      } else {
        console.error('Failed to fetch settings')
        setSettings(defaultSettings)
        // Set default currency
        setGlobalCurrency(defaultSettings.currency)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings(defaultSettings)
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      })

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        // Update global currency when settings are updated
        if (updatedSettings.currency) {
          setGlobalCurrency(updatedSettings.currency)
        }
        toast.success('Settings saved successfully!')
      } else {
        const errorData = await response.json()
        const errorMessage = errorData.details || errorData.error || 'Failed to save settings'
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    }
  }

  const refreshSettings = async () => {
    setIsLoading(true)
    await fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
} 