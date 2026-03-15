import { createContext, useContext, useState, useEffect } from 'react'
import { generateId } from '../data/fileStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('easyshare_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        setIsAuthenticated(true)
      } catch { }
    }
    setLoading(false)
  }, [])

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('easyshare_users') || '[]')
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, message: 'Invalid email or password' }

    const { password: _, ...safe } = found
    const userData = { ...safe, lastLogin: new Date().toLocaleString() }
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('easyshare_user', JSON.stringify(userData))
    return { success: true }
  }

  const register = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('easyshare_users') || '[]')
    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Email already registered' }
    }
    const newUser = {
      id: generateId(),
      name,
      email,
      password,
      course: '',
      college: '',
      semester: '',
      supervisor: '',
      lastLogin: null,
    }
    users.push(newUser)
    localStorage.setItem('easyshare_users', JSON.stringify(users))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('easyshare_user')
  }

  const updateProfile = (data) => {
    const updated = { ...user, ...data }
    setUser(updated)
    localStorage.setItem('easyshare_user', JSON.stringify(updated))
    const users = JSON.parse(localStorage.getItem('easyshare_users') || '[]')
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data }
      localStorage.setItem('easyshare_users', JSON.stringify(users))
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
