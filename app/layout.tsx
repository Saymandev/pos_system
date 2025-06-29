import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Restaurant POS System',
  description: 'A modern point of sale system for restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="hide-scrollbar">
      <body className={`${inter.className} hide-scrollbar`}>
        <AuthProvider>
          <SettingsProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" />
            </CartProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 