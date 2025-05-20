// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import HeaderPages from './components/HeaderPages'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ARTFY',
  description: 'Sua plataforma de arte digital',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <HeaderPages />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}