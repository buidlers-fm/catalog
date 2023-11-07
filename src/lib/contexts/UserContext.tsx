"use client"

import { createContext, useState, useCallback, useEffect, useMemo, useContext } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import humps from "humps"

type User = {
  id?: string
  username: string
  email: string
}

type UserProviderValue = {
  currentUser?: User | null
  signUp: (email: string, username: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const UserContext = createContext<UserProviderValue | undefined>(undefined)

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState<User | null>()

  const supabase = createClientComponentClient()

  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    const { session } = humps.camelizeKeys(data)

    if (!session) return null

    const { user: userData } = session

    const {
      email,
      userMetadata: { username },
    } = userData

    const _user = {
      email,
      username,
    }

    console.log(_user)
    setCurrentUser(_user)
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
        email: userEmail,
        userMetadata: { username },
      } = userData

      const _user = {
        email: userEmail,
        username,
      }

      console.log(_user)
      setCurrentUser(_user)
    },
    [supabase.auth],
  )

  const signUp = useCallback(
    async (email: string, username: string, password: string) => {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        body: JSON.stringify({
          email,
          username,
          password,
        }),
      })

      if (res.status === 200) {
        await signIn(email, password)
      } else {
        const { error } = await res.json()
        throw new Error(error)
      }
    },
    [signIn],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    setCurrentUser(null)
  }, [supabase.auth])

  const providerValue = useMemo(
    () => ({ currentUser, signUp, signIn, signOut }),
    [currentUser, signUp, signIn, signOut],
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
