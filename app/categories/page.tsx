'use client'

import CategoryModal from '@/components/categories/CategoryModal'
import DashboardLayout from '@/components/ui/DashboardLayout'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import { PencilIcon, PlusIcon, TagIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface Category {
  id: string
  name: string
  description?: string
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    items: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        throw new Error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    setShowModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowModal(true)
  }

  const handleDeleteCategory = (category: Category) => {
    setDeletingCategory(category)
  }

  const confirmDelete = async () => {
    if (!deletingCategory) return

    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(categories.filter(c => c.id !== deletingCategory.id))
        toast.success('Category deleted successfully')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setDeletingCategory(null)
    }
  }

  const handleSaveCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
      const method = editingCategory ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        const savedCategory = await response.json()
        
        if (editingCategory) {
          setCategories(categories.map(c => c.id === savedCategory.id ? savedCategory : c))
          toast.success('Category updated successfully')
        } else {
          setCategories([...categories, savedCategory])
          toast.success('Category created successfully')
        }
        
        setShowModal(false)
        setEditingCategory(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save category')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-48 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-32 h-12 bg-blue-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Search and Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="w-full h-12 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            {/* Stats Cards */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm animate-pulse">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-200 rounded mx-auto mb-2"></div>
                <div className="w-20 h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm animate-pulse">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-200 rounded mx-auto mb-2"></div>
                <div className="w-24 h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          </div>

          {/* Categories Grid Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 animate-pulse">
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="w-20 h-5 bg-gray-200 rounded mb-2"></div>
                        <div className="flex space-x-2">
                          <div className="w-12 h-4 bg-green-200 rounded-full"></div>
                          <div className="w-16 h-4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 mb-4">
                    <div className="w-full h-3 bg-gray-200 rounded"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between text-xs pt-4 border-t border-gray-100">
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loading Text Overlay */}
          <div className="fixed top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 z-50">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">Loading categories...</span>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <TagIcon className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                Categories Management
              </h1>
              <p className="text-gray-600 mt-2">Organize your menu with categories</p>
            </div>
            <button
              onClick={handleAddCategory}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center w-full sm:w-auto"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Category
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Search */}
          <div className="sm:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Total Categories</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {categories.filter(c => c.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Categories</div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-20">
              <TagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No categories found' : 'No categories yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Get started by creating your first category'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddCategory}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create First Category
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Category Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {category.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              category.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {category._count?.items || 0} items
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Category Description */}
                  {category.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Category Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 pt-4 border-t border-gray-100 space-y-1 sm:space-y-0">
                    <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(category.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setShowModal(false)
            setEditingCategory(null)
          }}
        />
      )}

      {deletingCategory && (
        <DeleteConfirmModal
          title="Delete Category"
          message={`Are you sure you want to delete "${deletingCategory.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </DashboardLayout>
  )
} 