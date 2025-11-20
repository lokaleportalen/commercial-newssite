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
      // Try to get current user from Payload's built-in endpoint
      const response = await fetch('/api/users/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()

        // Payload returns { user: {...} } format
        if (data.user) {
          setAuthState({
            user: {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              collection: data.user.collection || 'users',
            },
            isPending: false,
          })
        } else {
          setAuthState({
            user: null,
            isPending: false,
          })
        }
      } else {
        setAuthState({
          user: null,
          isPending: false,
        })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setAuthState({
        user: null,
        isPending: false,
      })
    }
  }

  const signIn = async (email: string, password: string, collection: 'users' | 'admins' = 'users') => {
    try {
      // Use Payload's built-in login endpoint
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
        return { error: error.message || error.errors?.[0]?.message || 'Login failed', user: null }
      }

      const data = await response.json()

      // Payload returns the user and token
      if (data.user) {
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          collection: collection,
        }

        setAuthState({
          user,
          isPending: false,
        })

        return { user, error: null }
      }

      return { error: 'Login failed', user: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error: 'Network error', user: null }
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    try {
      // Create a new user via Payload's REST API
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return { error: error.message || error.errors?.[0]?.message || 'Signup failed', user: null }
      }

      const data = await response.json()

      // After successful signup, automatically sign in
      if (data.doc) {
        return await signIn(email, password, 'users')
      }

      return { error: 'Signup failed', user: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error: 'Network error', user: null }
    }
  }

  const signOut = async () => {
    try {
      // Use Payload's built-in logout endpoint
      await fetch('/api/users/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      setAuthState({
        user: null,
        isPending: false,
      })

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear the state even if the request fails
      setAuthState({
        user: null,
        isPending: false,
      })
      router.push('/')
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
