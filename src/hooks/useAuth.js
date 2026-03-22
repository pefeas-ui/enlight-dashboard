import { useState, useEffect, useCallback } from 'react'
import { AUTH_API } from '../data/config'

const SESSION_KEY = 'enlight_user'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(AUTH_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      })
      const data = await res.json()
      if (data.success) {
        const userData = {
          nombre: data.nombre,
          email: data.email,
          rol: data.rol,
        }
        setUser(userData)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userData))
        return true
      } else {
        setError(data.message || 'Credenciales incorrectas')
        return false
      }
    } catch (e) {
      setError('Error de conexión')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const isAdmin = user?.rol === 'admin'
  const isController = ['admin', 'controller'].includes(user?.rol)
  const isGerente = ['admin', 'gerente'].includes(user?.rol)

  return { user, loading, error, login, logout, isAdmin, isController, isGerente }
}
