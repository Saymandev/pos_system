'use client'

import DashboardLayout from '@/components/ui/DashboardLayout'
import { useSettings } from '@/contexts/SettingsContext'
import { setGlobalCurrency } from '@/lib/utils'
import { BellIcon, BuildingStorefrontIcon, CloudArrowDownIcon, Cog6ToothIcon, CurrencyDollarIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { settings, isLoading: settingsLoading, updateSettings } = useSettings()
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Local form state
  const [restaurantInfo, setRestaurantInfo] = useState({
    restaurantName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    timezone: '',
  })

  const [taxSettings, setTaxSettings] = useState({
    taxRate: 0,
    taxName: '',
    includeTaxInPrice: false,
    roundTax: true,
  })

  const [systemPrefs, setSystemPrefs] = useState({
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    timeFormat: '12h',
    orderNumberPrefix: 'ORD',
    enableNotifications: true,
    autoBackup: true,
    printReceipts: true,
    requireConfirmation: true,
  })

  // Update global currency when settings change
  useEffect(() => {
    if (settings?.currency) {
      setGlobalCurrency(settings.currency)
    }
  }, [settings?.currency])

  // Initialize form with settings data
  useEffect(() => {
    if (settings) {
      setRestaurantInfo({
        restaurantName: settings.restaurantName,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        phone: settings.phone,
        email: settings.email,
        website: settings.website,
        timezone: settings.timezone,
      })

      setTaxSettings({
        taxRate: settings.taxRate,
        taxName: settings.taxName,
        includeTaxInPrice: settings.includeTaxInPrice,
        roundTax: settings.roundTax,
      })

      setSystemPrefs({
        currency: settings.currency,
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        orderNumberPrefix: settings.orderNumberPrefix,
        enableNotifications: settings.enableNotifications,
        autoBackup: settings.autoBackup,
        printReceipts: settings.printReceipts,
        requireConfirmation: settings.requireConfirmation,
      })
    }
  }, [settings])

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, settingsLoading ? 2000 : 500)
    
    return () => clearTimeout(timer)
  }, [settingsLoading])

  const handleSaveSection = async (section: string, data: any) => {
    setIsSaving(true)
    try {
      await updateSettings(data)
      // Update global currency immediately if currency was changed
      if (data.currency) {
        setGlobalCurrency(data.currency)
      }
    } catch (error) {
      console.error(`Error saving ${section}:`, error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBackupData = async () => {
    try {
      toast.loading('Generating backup...', { id: 'backup' })
      
      // Simulate backup generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a backup file with current settings
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        data: {
          restaurantInfo,
          taxSettings,
          systemPrefs,
          settings: settings,
          note: 'Restaurant POS System backup file'
        }
      }
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `restaurant-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Backup downloaded successfully!', { id: 'backup' })
    } catch (error) {
      toast.error('Failed to generate backup', { id: 'backup' })
    }
  }

  if (isInitialLoading || settingsLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-64 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Settings Cards Skeleton */}
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center mb-6">
                  <div className="w-6 h-6 bg-blue-200 rounded mr-3"></div>
                  <div className="w-48 h-6 bg-gray-200 rounded"></div>
                </div>

                <div className="space-y-4">
                  {/* Form Fields Skeleton */}
                  {Array.from({ length: i === 0 ? 6 : i === 1 ? 4 : i === 2 ? 5 : 3 }, (_, j) => (
                    <div key={j}>
                      <div className="w-24 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}

                  {/* Checkboxes for some cards */}
                  {(i === 1 || i === 2) && (
                    <div className="space-y-3">
                      {Array.from({ length: i === 1 ? 2 : 4 }, (_, k) => (
                        <div key={k} className="flex items-center">
                          <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                          <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview box for tax settings */}
                  {i === 1 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="w-full h-4 bg-blue-200 rounded"></div>
                    </div>
                  )}

                  {/* Warning box for backup section */}
                  {i === 3 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-200 rounded mr-3"></div>
                        <div className="flex-1">
                          <div className="w-40 h-4 bg-yellow-200 rounded mb-1"></div>
                          <div className="w-48 h-3 bg-yellow-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="w-full h-10 bg-blue-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>

          {/* System Information Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="w-40 h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Text Overlay */}
          <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-50">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading settings...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Cog6ToothIcon className="w-8 h-8 mr-3 text-blue-600" />
                System Settings
              </h1>
              <p className="text-gray-600 mt-2">Configure your restaurant POS system</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Restaurant Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <BuildingStorefrontIcon className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Restaurant Information</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantInfo.restaurantName}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, restaurantName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={restaurantInfo.phone}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={restaurantInfo.address}
                  onChange={(e) => setRestaurantInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={restaurantInfo.city}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={restaurantInfo.state}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={restaurantInfo.zipCode}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={restaurantInfo.email}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={restaurantInfo.website}
                    onChange={(e) => setRestaurantInfo(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={restaurantInfo.timezone}
                  onChange={(e) => setRestaurantInfo(prev => ({ ...prev, timezone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              </div>

              <button
                onClick={() => handleSaveSection('Restaurant Information', restaurantInfo)}
                disabled={isSaving}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Restaurant Info'}
              </button>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <CurrencyDollarIcon className="w-6 h-6 text-green-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Tax Settings</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="100"
                    value={taxSettings.taxRate}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Name</label>
                  <input
                    type="text"
                    value={taxSettings.taxName}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, taxName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={taxSettings.includeTaxInPrice}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, includeTaxInPrice: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include tax in item prices</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={taxSettings.roundTax}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, roundTax: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Round tax to nearest cent</span>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-blue-800">
                  <strong>Preview:</strong> A $10.00 item will show {taxSettings.includeTaxInPrice ? 'as $10.00 (tax included)' : `$${(10 * (1 + taxSettings.taxRate / 100)).toFixed(2)} total`}
                </div>
              </div>

              <button
                onClick={() => handleSaveSection('Tax Settings', taxSettings)}
                disabled={isSaving}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Tax Settings'}
              </button>
            </div>
          </div>

          {/* System Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <BellIcon className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">System Preferences</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={systemPrefs.currency}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="BDT">BDT (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                  <select
                    value={systemPrefs.dateFormat}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="MM/dd/yyyy">MM/dd/yyyy</option>
                    <option value="dd/MM/yyyy">dd/MM/yyyy</option>
                    <option value="yyyy-MM-dd">yyyy-MM-dd</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time Format</label>
                  <select
                    value={systemPrefs.timeFormat}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, timeFormat: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="12h">12 Hour (AM/PM)</option>
                    <option value="24h">24 Hour</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Number Prefix</label>
                  <input
                    type="text"
                    value={systemPrefs.orderNumberPrefix}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, orderNumberPrefix: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={5}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemPrefs.enableNotifications}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemPrefs.autoBackup}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable automatic backups</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemPrefs.printReceipts}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, printReceipts: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Auto-print receipts</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={systemPrefs.requireConfirmation}
                    onChange={(e) => setSystemPrefs(prev => ({ ...prev, requireConfirmation: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Require confirmation for deletions</span>
                </label>
              </div>

              <button
                onClick={() => handleSaveSection('System Preferences', systemPrefs)}
                disabled={isSaving}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Backup & Security */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-6">
              <ShieldCheckIcon className="w-6 h-6 text-red-600 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Backup & Security</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">⚠️</div>
                  <div>
                    <div className="font-medium text-yellow-800">Regular Backups Recommended</div>
                    <div className="text-sm text-yellow-700">Backup your data regularly to prevent loss</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleBackupData}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                  Download Backup
                </button>

                <div className="text-sm text-gray-600 text-center">
                  Last backup: {settings?.updatedAt ? new Date(settings.updatedAt).toLocaleDateString() : 'Never'}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Security Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Password Protection:</span>
                    <span className="text-green-600 font-medium">✓ Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data Encryption:</span>
                    <span className="text-green-600 font-medium">✓ Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Timeout:</span>
                    <span className="text-blue-600 font-medium">24 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">v1.0.0</div>
              <div className="text-sm text-gray-600">POS Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-sm text-gray-600">System Health</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">2.1 GB</div>
              <div className="text-sm text-gray-600">Database Size</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 