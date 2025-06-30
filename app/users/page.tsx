'use client'

import DashboardLayout from '@/components/ui/DashboardLayout'
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal'
import UserModal from '@/components/users/UserModal'
import { useAuth } from '@/contexts/AuthContext'
import { useSystemPreferences } from '@/lib/useSystemPreferences'
import { EyeIcon, EyeSlashIcon, MagnifyingGlassIcon, PencilIcon, PlusIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'MANAGER' | 'STAFF'
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    orders: number
  }
}

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { requiresConfirmation, showSuccessNotification, showErrorNotification } = useSystemPreferences()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        throw new Error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...users]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? user.isActive : !user.isActive
      )
    }

    setFilteredUsers(filtered)
  }

  const handleAddUser = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const handleDeleteUser = (user: User) => {
    // Prevent users from deleting themselves
    if (currentUser?.id === user.id) {
      showErrorNotification('You cannot delete your own account')
      return
    }

    // Only admins can delete users
    if (currentUser?.role !== 'ADMIN') {
      showErrorNotification('Only administrators can delete users')
      return
    }

    if (requiresConfirmation()) {
      setDeletingUser(user)
    } else {
      // Delete directly without confirmation
      confirmDelete(user)
    }
  }

  const confirmDelete = async (userToDelete = deletingUser) => {
    if (!userToDelete) return

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      })

      const responseData = await response.json()

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userToDelete.id))
        showSuccessNotification('User deleted successfully')
      } else {
        console.error('Delete user error:', responseData)
        throw new Error(responseData.error || 'Failed to delete user')
      }
    } catch (error: any) {
      console.error('Delete user error:', error)
      showErrorNotification(error.message || 'Failed to delete user')
    } finally {
      setDeletingUser(null)
    }
  }

  const handleSaveUser = async (userData: any) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users'
      const method = editingUser ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        const savedUser = await response.json()
        if (editingUser) {
          setUsers(users.map(u => u.id === editingUser.id ? savedUser : u))
          showSuccessNotification('User updated successfully')
        } else {
          setUsers([savedUser, ...users])
          showSuccessNotification('User created successfully')
        }
        setShowModal(false)
        setEditingUser(null)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save user')
      }
    } catch (error: any) {
      showErrorNotification(error.message)
    }
  }

  const toggleUserStatus = async (user: User) => {
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u))
        toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'}`)
      } else {
        throw new Error('Failed to update user status')
      }
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setRoleFilter('')
    setStatusFilter('')
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'MANAGER': return 'bg-blue-100 text-blue-800'
      case 'STAFF': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN': return '👑'
      case 'MANAGER': return '👨‍💼'
      case 'STAFF': return '👨‍🍳'
      default: return '👤'
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="w-56 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="w-28 h-12 bg-blue-200 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-36 h-6 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-blue-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <div className="w-16 h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm animate-pulse">
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-200 rounded mx-auto mb-1"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Users Grid Skeleton */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-200 rounded-full"></div>
                      <div>
                        <div className="w-24 h-5 bg-gray-200 rounded mb-1"></div>
                        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
                          <div className="w-12 h-5 bg-green-200 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <div className="w-8 h-6 bg-blue-200 rounded mx-auto mb-1"></div>
                      <div className="w-20 h-3 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  </div>

                  {/* User Footer */}
                  <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100">
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
              <span className="text-sm font-medium text-gray-700">Loading users...</span>
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
                <UsersIcon className="w-8 h-8 mr-3 text-blue-600" />
                User Management
              </h1>
              <p className="text-gray-600 mt-2">Manage staff accounts and permissions</p>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
              <div className="text-sm text-gray-600">Administrators</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{filteredUsers.length}</div>
              <div className="text-sm text-gray-600">Filtered Results</div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-20">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter || statusFilter
                  ? 'No users match your filters'
                  : 'No users yet'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || roleFilter || statusFilter
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding your first team member'
                }
              </p>
              {!(searchTerm || roleFilter || statusFilter) && (
                <button
                  onClick={handleAddUser}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add First User
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* User Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            <span className="mr-1">{getRoleIcon(user.role)}</span>
                            {user.role}
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit user"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.isActive
                            ? 'text-red-600 hover:bg-red-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {user.isActive ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={currentUser?.id === user.id || currentUser?.role !== 'ADMIN'}
                        className={`p-2 rounded-lg transition-colors ${
                          currentUser?.id === user.id || currentUser?.role !== 'ADMIN'
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={
                          currentUser?.id === user.id
                            ? 'Cannot delete your own account'
                            : currentUser?.role !== 'ADMIN'
                            ? 'Only administrators can delete users'
                            : 'Delete user'
                        }
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* User Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {user._count?.orders || 0}
                      </div>
                      <div className="text-xs text-gray-600">Orders Processed</div>
                    </div>
                  </div>

                  {/* User Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-100">
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(user.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <UserModal
          user={editingUser}
          currentUser={currentUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
        />
      )}

      {/* Conditionally show delete confirmation modal */}
      {deletingUser && requiresConfirmation() && (
        <DeleteConfirmModal
          title="Delete User"
          message={`Are you sure you want to delete "${deletingUser.name}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </DashboardLayout>
  )
} 