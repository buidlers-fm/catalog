"use client"

import { createContext, useState, useCallback, useEffect, useMemo, useContext } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import humps from "humps"
import api from "lib/api"
import type UserProfile from "types/UserProfile"

type User = {
  id?: string
  username: string
  email: string
}

type UserProviderValue = {
  currentUser?: User | null
  currentUserProfile?: UserProfile | null
  signUp: (email: string, username: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserProviderValue | undefined>(undefined)

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState<User | null>()
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>()

  const supabase = createClientComponentClient()

  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const { session } = humps.camelizeKeys(data)

    if (!session) return null

    const { user: userData } = session

    const {
      id: userId,
      email,
      userMetadata: { username },
    } = userData

    const _user = {
      email,
      username,
    }

    console.log(_user)
    setCurrentUser(_user)

    const _currentUserProfile = await api.profiles.find(userId)
    if (_currentUserProfile) setCurrentUserProfile(_currentUserProfile)
  }, [supabase.auth])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.status === 400) {
          throw new Error("Invalid email or password.")
        } else {
          throw error
        }
      }

      console.log(data)
      const { user: userData } = humps.camelizeKeys(data)

      const {
        id: userId,
        email: userEmail,
        userMetadata: { username },
      } = userData

      const _user = {
        email: userEmail,
        username,
      }

      console.log(_user)
      setCurrentUser(_user)

      const _currentUserProfile = await api.profiles.find(userId)
      if (_currentUserProfile) setCurrentUserProfile(_currentUserProfile)
    },
    [supabase.auth],
  )

  const signUp = useCallback(
    async (email: string, username: string, password: string) => {
      const requestData = {
        email,
        username,
        password,
      }

      await api.auth.signUp(requestData)
      await signIn(email, password)
    },
    [signIn],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    setCurrentUser(null)
    setCurrentUserProfile(null)
  }, [supabase.auth])

  const providerValue = useMemo(
    () => ({ currentUser, currentUserProfile, signUp, signIn, signOut }),
    [currentUser, currentUserProfile, signUp, signIn, signOut],
  )

  return <UserContext.Provider value={providerValue}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
