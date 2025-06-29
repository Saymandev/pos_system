'use client'

import ItemModal from '@/components/items/ItemModal'
import DashboardLayout from '@/components/ui/DashboardLayout'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { formatPrice } from '@/lib/utils'
import { ArrowDownIcon, ArrowUpIcon, FunnelIcon, PencilIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Item {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isAvailable: boolean
  categoryId: string
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  color: string
  isActive?: boolean
}

type SortField = 'name' | 'price' | 'category' | 'createdAt'
type SortOrder = 'asc' | 'desc'

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredItems, setFilteredItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [deletingItem, setDeletingItem] = useState<Item | null>(null)
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [items, searchTerm, selectedCategory, availabilityFilter, priceRange, sortField, sortOrder])

  const fetchData = async () => {
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/items'),
        fetch('/api/categories')
      ])

      if (itemsResponse.ok && categoriesResponse.ok) {
        const itemsData = await itemsResponse.json()
        const categoriesData = await categoriesResponse.json()
        
        setItems(itemsData)
        setCategories(categoriesData)
      } else {
        throw new Error('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load items')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...items]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(item => item.categoryId === selectedCategory)
    }

    // Availability filter
    if (availabilityFilter) {
      filtered = filtered.filter(item => 
        availabilityFilter === 'available' ? item.isAvailable : !item.isAvailable
      )
    }

    // Price range filter
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter(item => {
        const min = priceRange.min ? parseFloat(priceRange.min) : 0
        const max = priceRange.max ? parseFloat(priceRange.max) : Infinity
        return item.price >= min && item.price <= max
      })
    }

    // Sorting
    filtered.sort((a, b) => {
      let valueA, valueB

      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'price':
          valueA = a.price
          valueB = b.price
          break
        case 'category':
          valueA = a.category.name.toLowerCase()
          valueB = b.category.name.toLowerCase()
          break
        case 'createdAt':
          valueA = new Date(a.createdAt).getTime()
          valueB = new Date(b.createdAt).getTime()
          break
        default:
          return 0
      }

      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    setFilteredItems(filtered)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setShowModal(true)
  }

  const handleEditItem = (item: Item) => {
    setEditingItem(item)
    setShowModal(true)
  }

  const handleDeleteItem = (item: Item) => {
    setDeletingItem(item)
  }

  const confirmDelete = async () => {
    if (!deletingItem) return

    try {
      const response = await fetch(`/api/items/${deletingItem.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setItems(items.filter(i => i.id !== deletingItem.id))
        toast.success('Item deleted successfully')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete item')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeletingItem(null)
    }
  }

  const handleSaveItem = async (itemData: any) => {
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items'
      const method = editingItem ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      })

      if (response.ok) {
        const savedItem = await response.json()
        
        if (editingItem) {
          setItems(items.map(i => i.id === savedItem.id ? savedItem : i))
          toast.success('Item updated successfully')
        } else {
          setItems([...items, savedItem])
          toast.success('Item created successfully')
        }
        
        setShowModal(false)
        setEditingItem(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save item')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const toggleAvailability = async (item: Item) => {
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      })

      if (response.ok) {
        const updatedItem = await response.json()
        setItems(items.map(i => i.id === updatedItem.id ? updatedItem : i))
        toast.success(`Item ${updatedItem.isAvailable ? 'enabled' : 'disabled'}`)
      } else {
        throw new Error('Failed to update item')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setAvailabilityFilter('')
    setPriceRange({ min: '', max: '' })
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4 md:space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 animate-pulse">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div>
                <div className="w-56 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-32 h-12 bg-blue-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 animate-pulse">
            <div className="flex justify-between items-center mb-4">
              <div className="w-32 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-blue-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i}>
                  <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm animate-pulse">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Items Table Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Image', 'Name', 'Category', 'Price', 'Status', 'Actions'].map((header, i) => (
                        <th key={i} className="px-6 py-3 text-left">
                          <div className="w-16 h-4 bg-gray-300 rounded animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: 8 }, (_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="w-32 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-20 h-6 bg-green-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 h-4 bg-gray-200 rounded-full"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                      <div className="flex space-x-1">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Text Overlay */}
          <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-50">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading items...</span>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
                <PhotoIcon className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3 text-blue-600" />
                Items Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your menu items and pricing</p>
            </div>
            <button
              onClick={handleAddItem}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center w-full md:w-auto"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters & Search
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full sm:w-auto text-center sm:text-left"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Items</option>
                <option value="available">Available Only</option>
                <option value="unavailable">Unavailable Only</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Total Items</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                {items.filter(i => i.isAvailable).length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Available</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-red-600">
                {items.filter(i => !i.isAvailable).length}
              </div>
              <div className="text-xs md:text-sm text-gray-600">Unavailable</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-purple-600">{filteredItems.length}</div>
              <div className="text-xs md:text-sm text-gray-600">Filtered Results</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 md:py-20 px-4">
              <PhotoIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedCategory || availabilityFilter || priceRange.min || priceRange.max
                  ? 'No items match your filters'
                  : 'No items yet'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || selectedCategory || availabilityFilter || priceRange.min || priceRange.max
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first menu item'
                }
              </p>
              {!(searchTerm || selectedCategory || availabilityFilter || priceRange.min || priceRange.max) && (
                <button
                  onClick={handleAddItem}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First Item
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden">
                <div className="divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <div key={item.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <PhotoIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {item.name}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{item.description}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                                  style={{ backgroundColor: item.category.color + '20', color: item.category.color }}
                                >
                                  {item.category.name}
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-2">
                              <button
                                onClick={() => toggleAvailability(item)}
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  item.isAvailable
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                              >
                                {item.isAvailable ? 'Available' : 'Unavailable'}
                              </button>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditItem(item)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Category</span>
                          {sortField === 'category' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Price</span>
                          {sortField === 'price' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {sortField === 'createdAt' && (
                            sortOrder === 'asc' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                <PhotoIcon className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                            style={{ backgroundColor: item.category.color + '20', color: item.category.color }}
                          >
                            {item.category.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleAvailability(item)}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                              item.isAvailable
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                              title="Edit item"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                              title="Delete item"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ItemModal
          item={editingItem}
          categories={categories}
          onSave={handleSaveItem}
          onClose={() => {
            setShowModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {deletingItem && (
        <DeleteConfirmModal
          title="Delete Item"
          message={`Are you sure you want to delete "${deletingItem.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingItem(null)}
        />
      )}
    </DashboardLayout>
  )
} 