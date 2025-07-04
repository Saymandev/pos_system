'use client'

import { useAuth } from '@/contexts/AuthContext'
import {
  ArchiveBoxIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  TagIcon,
  UserCircleIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMenusDropdownOpen, setIsMenusDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
    { name: 'POS System', href: '/pos', icon: ShoppingCartIcon },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { 
      name: 'Menus', 
      icon: Squares2X2Icon,
      isDropdown: true,
      children: [
        { name: 'Categories', href: '/categories', icon: TagIcon },
        { name: 'Menu Items', href: '/items', icon: ArchiveBoxIcon },
      ]
    },
    { name: 'Users', href: '/users', icon: UserGroupIcon },
    { name: 'Settings', href: '/settings', icon: CogIcon },
  ]

  // Role-based access control
  const hasAccess = (route: string) => {
    if (!user) return false
    
    // Admin has access to everything
    if (user.role === 'ADMIN') return true
    
    // Manager has access to most things except user management
    if (user.role === 'MANAGER') {
      return route !== '/users' // Managers can't manage users
    }
    
    // Staff has limited access
    if (user.role === 'STAFF') {
      return ['/dashboard', '/pos', '/orders'].includes(route)
    }
    
    return false
  }

  // Check if user has access to any child items in dropdown
  const hasDropdownAccess = (children: any[]) => {
    return children.some(child => child.href && hasAccess(child.href))
  }

  const filteredNavigation = navigation.filter(item => {
    if (item.isDropdown) {
      return hasDropdownAccess(item.children)
    }
    return item.href && hasAccess(item.href)
  })

  // Check if any menu items are active
  const isMenusActive = pathname === '/categories' || pathname === '/items'

  const renderNavigationItem = (item: any, isMobile = false) => {
    if (item.isDropdown) {
      const Icon = item.icon
      const isActive = isMenusActive
      const isOpen = isMenusDropdownOpen
      
      return (
        <div key={item.name}>
          <button
            onClick={() => setIsMenusDropdownOpen(!isMenusDropdownOpen)}
            className={`
              w-full group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${isActive 
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <div className="flex items-center">
              <Icon 
                className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
              />
              {item.name}
            </div>
            {isOpen ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
          </button>
          
          {isOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children
                .filter((child: any) => hasAccess(child.href))
                .map((child: any) => {
                  const isChildActive = pathname === child.href
                  const ChildIcon = child.icon
                  
                  return (
                    <Link
                      key={child.name}
                      href={child.href}
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                        ${isChildActive 
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <ChildIcon 
                        className={`mr-3 h-4 w-4 ${isChildActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
                      />
                      {child.name}
                    </Link>
                  )
                })}
            </div>
          )}
        </div>
      )
    } else {
      const isActive = pathname === item.href
      const Icon = item.icon
      
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => isMobile && setIsMobileMenuOpen(false)}
          className={`
            group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
            ${isActive 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }
          `}
        >
          <Icon 
            className={`mr-3 h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
          />
          {item.name}
        </Link>
      )
    }
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900"
        >
          {isMobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:bg-white lg:shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
            <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-lg font-semibold text-gray-900">Restaurant POS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {filteredNavigation.map((item) => renderNavigationItem(item, false))}
          </nav>

          {/* User Info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <div className="flex items-center space-x-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    user?.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile menu */}
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              {/* Logo */}
              <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
                <BuildingStorefrontIcon className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-lg font-semibold text-gray-900">Restaurant POS</span>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                {filteredNavigation.map((item) => renderNavigationItem(item, true))}
              </nav>

              {/* User Info */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <div className="flex items-center space-x-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user?.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user?.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
} 