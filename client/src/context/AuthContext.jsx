import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import authApi from '../api/auth.api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const login = useCallback((userData, userToken) => {
    setUser(userData)
    setToken(userToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', userToken)
  }, [])

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          const res = await authApi.getMe()
          if (isMounted) {
            setUser(res.user)
            localStorage.setItem('user', JSON.stringify(res.user))
          }
        } catch (err) {
          console.error('Failed to restore session:', err.message)
          if (isMounted) {
            logout()
          }
        }
      }
      if (isMounted) {
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [logout])

  const updateCurrency = async (newCurrency) => {
    const res = await authApi.updateCurrency(newCurrency)
    setUser(res.user)
    localStorage.setItem('user', JSON.stringify(res.user))
    return res.user
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateCurrency,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
