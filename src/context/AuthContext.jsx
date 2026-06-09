import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('easyshare_token')
    const stored = localStorage.getItem('easyshare_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
        setIsAuthenticated(true)
      } catch { }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const { data } = await client.post('/auth/login', { email, password })
      localStorage.setItem('easyshare_token', data.token)
      localStorage.setItem('easyshare_user', JSON.stringify(data.user))
      setUser(data.user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      return { success: false, message: msg }
    }
  }

  const register = async (name, email, password) => {
    try {
      await client.post('/auth/register', { name, email, password })
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      return { success: false, message: msg }
    }
  }

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('easyshare_token')
    localStorage.removeItem('easyshare_user')
  }, [])

  const updateProfile = async (data) => {
    try {
      const { data: res } = await client.put('/auth/profile', data)
      setUser(res.user)
      localStorage.setItem('easyshare_user', JSON.stringify(res.user))
      return { success: true }
    } catch (err) {
      const msg = err.response?.data?.message || 'Update failed'
      return { success: false, message: msg }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
