import { useSettings } from '@/contexts/SettingsContext'
import { useCallback, useEffect } from 'react'
import { toast } from 'react-hot-toast'

export function useSystemPreferences() {
  const { settings } = useSettings()

  // Conditional toast notifications
  const showNotification = useCallback((message: string, options?: any) => {
    if (settings?.enableNotifications) {
      return toast(message, options)
    }
    return null
  }, [settings?.enableNotifications])

  const showSuccessNotification = useCallback((message: string, options?: any) => {
    if (settings?.enableNotifications) {
      return toast.success(message, options)
    }
    return null
  }, [settings?.enableNotifications])

  const showErrorNotification = useCallback((message: string, options?: any) => {
    if (settings?.enableNotifications) {
      return toast.error(message, options)
    }
    return null
  }, [settings?.enableNotifications])

  const showLoadingNotification = useCallback((message: string, options?: any) => {
    if (settings?.enableNotifications) {
      return toast.loading(message, options)
    }
    return null
  }, [settings?.enableNotifications])

  // Auto-backup functionality
  const performAutoBackup = useCallback(async () => {
    if (!settings?.autoBackup) return false

    try {
      const response = await fetch('/api/backup')
      if (!response.ok) {
        throw new Error('Backup failed')
      }

      const backupData = await response.json()
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `auto-backup-${timestamp}.json`
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      if (settings?.enableNotifications) {
        toast.success('Auto-backup completed successfully', { duration: 3000 })
      }
      
      return true
    } catch (error) {
      if (settings?.enableNotifications) {
        toast.error('Auto-backup failed', { duration: 3000 })
      }
      return false
    }
  }, [settings?.autoBackup, settings?.enableNotifications])

  // Setup auto-backup interval (daily at midnight)
  useEffect(() => {
    if (!settings?.autoBackup) return

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    // Set initial timeout for first backup at midnight
    const initialTimeout = setTimeout(() => {
      performAutoBackup()
      
      // Then set daily interval
      const dailyInterval = setInterval(() => {
        performAutoBackup()
      }, 24 * 60 * 60 * 1000) // 24 hours
      
      return () => clearInterval(dailyInterval)
    }, msUntilMidnight)

    return () => clearTimeout(initialTimeout)
  }, [settings?.autoBackup, performAutoBackup])

  // Deletion confirmation helper
  const requiresConfirmation = useCallback(() => {
    return settings?.requireConfirmation ?? true
  }, [settings?.requireConfirmation])

  // Auto-print receipts setting
  const shouldAutoPrint = useCallback(() => {
    return settings?.printReceipts ?? false
  }, [settings?.printReceipts])

  return {
    // Notification functions
    showNotification,
    showSuccessNotification,
    showErrorNotification,
    showLoadingNotification,
    notificationsEnabled: settings?.enableNotifications ?? true,
    
    // Backup functions
    performAutoBackup,
    autoBackupEnabled: settings?.autoBackup ?? false,
    
    // Confirmation functions
    requiresConfirmation,
    confirmationRequired: settings?.requireConfirmation ?? true,
    
    // Print functions
    shouldAutoPrint,
    autoPrintEnabled: settings?.printReceipts ?? false,
    
    // All settings
    settings
  }
} 