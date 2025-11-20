'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  collection: 'users' | 'admins'
}

interface AuthState {
  user: User | null
  isPending: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isPending: true,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/users/me', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isPending: false,
        })
      } else {
        setAuthState({
          user: null,
          isPending: false,
        })
      }
    } catch (error) {
      setAuthState({
        user: null,
        isPending: false,
      })
    }
  }

  const signIn = async (email: string, password: string, collection: 'users' | 'admins' = 'users') => {
    try {
      const response = await fetch(`/api/${collection}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { error: error.message || 'Login failed', user: null }
      }

      const data = await response.json()
      setAuthState({
        user: data.user,
        isPending: false,
      })

      return { user: data.user, error: null }
    } catch (error) {
      return { error: 'Network error', user: null }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { error: error.message || 'Signup failed', user: null }
      }

      const data = await response.json()

      // Auto-login after signup
      return await signIn(email, password)
    } catch (error) {
      return { error: 'Network error', user: null }
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setAuthState({
        user: null,
        isPending: false,
      })

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refresh: checkAuth,
  }
}
