'use client'

import PaymentModal from '@/components/pos/PaymentModal'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { ArrowLeftIcon, Bars3Icon, MagnifyingGlassIcon, MinusIcon, PlusIcon, ShoppingCartIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  color: string
  items: Item[]
}

interface Item {
  id: string
  name: string
  price: number
  description?: string
  image?: string
  isAvailable: boolean
  categoryId: string
  category: {
    id: string
    name: string
    color: string
  }
}

export default function POSPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [showCart, setShowCart] = useState(false)
  
  const cart = useCart()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, itemsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/items')
        ])

        if (!categoriesRes.ok || !itemsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const categoriesData = await categoriesRes.json()
        const itemsData = await itemsRes.json()

        // Filter available items
        const availableItems = itemsData.filter((item: Item) => item.isAvailable)

        setCategories(categoriesData)
        setItems(availableItems)
        
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id)
        }

        toast.success('Menu loaded successfully!')
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast.error('Failed to load menu data. Please refresh the page.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (item: Item) => {
    cart.addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      category: {
        name: item.category.name,
        color: item.category.color
      }
    })
    toast.success(`${item.name} added to cart`, {
      duration: 2000,
      icon: '🛒',
    })
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      cart.removeItem(itemId)
      toast.success('Item removed from cart')
    } else {
      cart.updateQuantity(itemId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      toast.error('Please add items to cart first', {
        icon: '🛒',
      })
      return
    }
    setShowPayment(true)
  }

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const filteredItems = selectedCategory 
    ? items.filter(item => 
        item.categoryId === selectedCategory && 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
        {/* Mobile Header Skeleton */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Left Sidebar Skeleton */}
        <div className="w-80 bg-white shadow-xl border-r border-gray-200 flex-shrink-0 hidden lg:flex flex-col">
          {/* Header Skeleton */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <div className="w-40 h-6 bg-blue-500 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-lg animate-pulse"></div>
            </div>
            <div className="w-32 h-4 bg-blue-500 rounded animate-pulse"></div>
          </div>

          {/* Search Skeleton */}
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Categories Skeleton */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
              <div className="w-40 h-4 bg-blue-200 rounded mx-auto animate-pulse"></div>
            </div>
            
            <div className="flex-1 p-3 space-y-3">
              {/* All Items Button Skeleton */}
              <div className="w-full p-3 bg-blue-200 rounded-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="w-20 h-4 bg-blue-300 rounded animate-pulse mb-2"></div>
                    <div className="w-16 h-3 bg-blue-300 rounded animate-pulse"></div>
                  </div>
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Category Buttons Skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full p-3 bg-gray-100 rounded-xl animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-gray-300 rounded animate-pulse mb-2"></div>
                      <div className="w-16 h-3 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Items Grid Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Header Skeleton - Desktop Only */}
          <div className="hidden lg:block p-6 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="text-right">
                <div className="w-24 h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                <div className="w-20 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Mobile Category Header Skeleton */}
          <div className="lg:hidden p-4 bg-white border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-6 bg-blue-200 rounded animate-pulse"></div>
            </div>
            <div className="flex space-x-2 pb-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-20 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Items Grid Skeleton */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto show-scrollbar min-h-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-100 animate-pulse">
                  {/* Item Image Skeleton */}
                  <div className="aspect-square bg-gray-200 rounded-t-2xl mb-2 lg:mb-4"></div>
                  
                  {/* Item Details Skeleton */}
                  <div className="p-3 lg:p-4">
                    <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="w-full h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="w-2/3 h-3 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-5 bg-green-200 rounded animate-pulse"></div>
                      <div className="w-8 h-8 bg-green-200 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Cart Skeleton */}
        <div className="hidden lg:flex w-96 bg-white shadow-xl border-l border-gray-200 flex-col flex-shrink-0">
          {/* Cart Header Skeleton */}
          <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="w-32 h-6 bg-green-500 rounded animate-pulse mb-2"></div>
            <div className="w-20 h-4 bg-green-500 rounded animate-pulse"></div>
          </div>
          
          {/* Cart Content Skeleton */}
          <div className="flex-1 p-8 text-center">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 animate-pulse"></div>
            <div className="w-32 h-5 bg-gray-200 rounded mx-auto animate-pulse mb-2"></div>
            <div className="w-48 h-4 bg-gray-200 rounded mx-auto animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text Overlay */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Loading Restaurant POS...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-gray-50 overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCategories(true)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">POS</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBackToDashboard}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ShoppingCartIcon className="w-6 h-6" />
            {cart.items.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cart.items.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Left Sidebar - Categories */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl border-r border-gray-200 transform transition-transform lg:relative lg:translate-x-0 lg:z-0 lg:w-80 lg:flex-shrink-0
        ${showCategories ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header with Back Button */}
        <div className="p-4 lg:p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg lg:text-xl font-bold flex items-center">
              <ShoppingCartIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
              Menu Categories
            </h2>
            <div className="flex space-x-1">
              <button
                onClick={handleBackToDashboard}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors hidden lg:block"
                title="Back to Dashboard"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCategories(false)}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-500 rounded-lg transition-colors lg:hidden"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-blue-100 text-sm">Select a category to browse</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Categories with Scroll */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Scroll indicator */}
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex-shrink-0">
            <p className="text-xs text-blue-600 text-center font-medium">
              {categories.length + 1} categories • Scroll to see all
            </p>
          </div>
          
          {/* Scrollable categories container */}
          <div className="flex-1 overflow-y-scroll touch-scroll show-scrollbar w-full" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            <div className="p-3 space-y-3 pb-6">
              {/* All Items Button */}
              <button
                onClick={() => {
                  setSelectedCategory(null)
                  setShowCategories(false)
                }}
                className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm lg:text-base">All Items</div>
                    <div className="text-xs lg:text-sm opacity-75 mt-1">
                      {items.length} total items
                    </div>
                  </div>
                  {selectedCategory === null && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </button>

              {/* Category Buttons */}
              {categories.map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id)
                    setShowCategories(false)
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 hover:shadow-md'
                  }`}
                  style={
                    selectedCategory === category.id 
                      ? { background: `linear-gradient(135deg, ${category.color}, ${category.color}dd)` }
                      : {}
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-sm lg:text-base">{category.name}</div>
                      <div className="text-xs lg:text-sm opacity-75 mt-1">
                        {items.filter(item => item.categoryId === category.id).length} items
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedCategory === category.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white/30"
                        style={{ backgroundColor: category.color }}
                      ></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Bottom padding for scroll */}
            <div className="h-8"></div>
          </div>
          
          {/* Scroll indicator bottom */}
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex-shrink-0">
            <div className="flex items-center justify-center space-x-1">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Center - Items Grid */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header - Desktop Only */}
        <div className="hidden lg:block p-6 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
              <p className="text-gray-600 mt-1">
                {selectedCategory 
                  ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} - ${filteredItems.length} items`
                  : `All Items - ${filteredItems.length} items`
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="font-semibold text-gray-900">Demo User</p>
            </div>
          </div>
        </div>

        {/* Mobile Category Header */}
        <div className="lg:hidden p-4 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-600">
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name || 'Category'} - ${filteredItems.length} items`
                : `All Items - ${filteredItems.length} items`
              }
            </p>
            <button
              onClick={() => setShowCategories(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-2 py-1 rounded"
            >
              All Categories
            </button>
          </div>
          
          {/* Horizontal Scrollable Categories */}
          <div className="overflow-x-auto touch-scroll show-scrollbar">
            <div className="flex space-x-2 pb-2">
              {/* All Items Chip */}
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Items ({items.length})
              </button>
              
              {/* Category Chips */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-medium transition-colors border-2 ${
                    selectedCategory === category.id
                      ? 'text-white border-white/30'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                  style={
                    selectedCategory === category.id 
                      ? { backgroundColor: category.color, borderColor: category.color }
                      : {}
                  }
                >
                  <div className="flex items-center space-x-1">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: selectedCategory === category.id ? 'white' : category.color }}
                    ></div>
                    <span>{category.name} ({items.filter(item => item.categoryId === category.id).length})</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Items Grid */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto show-scrollbar min-h-0">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 lg:py-20">
              <div className="text-gray-400 mb-4">
                <ShoppingCartIcon className="w-12 h-12 lg:w-16 lg:h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'This category has no items.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100"
                  onClick={() => handleAddToCart(item)}
                >
                  {/* Item Image */}
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-2xl mb-2 lg:mb-4 flex items-center justify-center relative overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-gray-400 group-hover:text-gray-500 transition-colors">
                        <svg className="w-8 h-8 lg:w-12 lg:h-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {/* Add button overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white rounded-full p-1.5 lg:p-2 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
                        <PlusIcon className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-3 lg:p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 text-sm lg:text-base">{item.name}</h3>
                    {item.description && (
                      <p className="text-xs lg:text-sm text-gray-600 mb-2 lg:mb-3 line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg lg:text-xl font-bold text-green-600">{formatPrice(item.price)}</span>
                      <button className="bg-green-500 hover:bg-green-600 text-white p-1.5 lg:p-2 rounded-lg transition-colors duration-200">
                        <PlusIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart (Desktop) */}
      <div className="hidden lg:flex w-96 bg-white shadow-xl border-l border-gray-200 flex-col flex-shrink-0">
        {/* Cart Header */}
        <div className="p-6 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <h2 className="text-xl font-bold flex items-center">
            <ShoppingCartIcon className="w-6 h-6 mr-2" />
            Current Order
          </h2>
          <p className="text-green-100 text-sm mt-1">
            {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in cart
          </p>
        </div>
        
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto touch-scroll show-scrollbar">
          {cart.items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 text-sm">Add items from the menu to get started</p>
            </div>
          ) : (
            <>
              {/* Scroll hint for many items */}
              {cart.items.length > 3 && (
                <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                  <p className="text-xs text-green-600 text-center">
                    {cart.items.length} items • Scroll to see all
                  </p>
                </div>
              )}
              
              <div className="p-4 space-y-3">
                {cart.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 rounded-xl p-4 border border-gray-100 animate-in slide-in-from-right duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{formatPrice(item.price)} each</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(item.id, item.quantity - 1)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              <MinusIcon className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-2 font-semibold min-w-[3rem] text-center">{item.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleQuantityChange(item.id, item.quantity + 1)
                              }}
                              className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              <PlusIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <span className="font-bold text-green-600">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          cart.removeItem(item.id)
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Bottom padding for scroll */}
                <div className="h-4"></div>
              </div>
            </>
          )}
        </div>

        {/* Cart Summary */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-4">
            {/* Totals */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (8.875%):</span>
                <span className="font-medium">{formatPrice(cart.tax)}</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatPrice(cart.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => {
                  cart.clearCart()
                  toast.success('Cart cleared')
                }}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart Modal */}
      {showCart && (
        <>
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col">
            {/* Cart Header */}
            <div className="p-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Current Order
                </h2>
                <button onClick={() => setShowCart(false)} className="p-1 text-green-100 hover:text-white">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="text-green-100 text-sm mt-1">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'} in cart
              </p>
            </div>
            
            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto show-scrollbar">
              {/* Scroll hint for many items */}
              {cart.items.length > 3 && (
                <div className="px-4 py-2 bg-green-50 border-b border-green-100 text-center">
                  <p className="text-xs text-green-600">
                    {cart.items.length} items • Scroll to see all
                  </p>
                </div>
              )}
              
              {cart.items.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="bg-gray-100 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm">Add items from the menu to get started</p>
                </div>
              ) : (
                <div className="p-4 space-y-3 pb-6">
                  {cart.items.map((item, index) => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{formatPrice(item.price)} each</p>
                          
                          {/* Mobile Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="px-3 py-2 font-semibold min-w-[3rem] text-center">{item.quantity}</span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <span className="font-bold text-green-600">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => cart.removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Cart Summary */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (8.875%):</span>
                    <span className="font-medium">{formatPrice(cart.tax)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">{formatPrice(cart.total)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowCart(false)
                      handleCheckout()
                    }}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200"
                  >
                    Proceed to Payment
                  </button>
                  <button
                    onClick={() => {
                      cart.clearCart()
                      toast.success('Cart cleared')
                      setShowCart(false)
                    }}
                    className="w-full bg-gray-200 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-300 transition-all duration-200"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Categories Modal Backdrop */}
      {showCategories && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setShowCategories(false)} />
      )}

      {/* Payment Modal */}
      {showPayment && (
        <PaymentModal
          cart={cart}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            cart.clearCart()
            setShowPayment(false)
            toast.success('Order completed successfully!', {
              duration: 4000,
              icon: '🎉',
            })
          }}
        />
      )}
    </div>
  )
} 