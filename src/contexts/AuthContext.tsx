'use client'
import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
  cpf?: string
  birthDate?: string
  phone?: string
  address?: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error('Error loading user:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pass: password }),
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao fazer login')
      }

      const data = await response.json()
      
      if (!data.user) {
        throw new Error('Dados do usuário não recebidos')
      }

      const userData = {
        id: String(data.user.id),
        name: data.user.name || '',
        email: data.user.email || '',
        role: data.user.role || 'USER',
        cpf: data.user.cpf || undefined,
        birthDate: data.user.birthDate || undefined,
        phone: data.user.phone || undefined,
        address: data.user.address || undefined
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('accessToken', data.accessToken)

      router.push(userData.role === 'ADMIN' ? '/admin/dashboard' : '/')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    router.push('/login')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}