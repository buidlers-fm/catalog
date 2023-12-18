"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { getUserProfileLink } from "lib/helpers/general"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function SignInForm({ toggleAuth, onSuccess }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signIn } = useUser()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const validateInput = () => {
    if (!email || !password) {
      throw new Error("Enter an email and a password.")
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    try {
      validateInput()
      const { currentUserProfile } = await signIn(email, password)

      onSuccess(currentUserProfile)
      if (pathname === "/") {
        router.push(getUserProfileLink(currentUserProfile.username))
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div>
      <FormInput
        labelText="email address"
        name="email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <FormInput
        labelText="password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button className="cat-btn cat-btn-gold my-4" onClick={handleSubmit} disabled={isSubmitting}>
        Sign in
      </button>
      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
      <div>
        Don't have an account?{" "}
        <button onClick={toggleAuth} className="cat-link text-none text-teal-500">
          Sign up
        </button>
        .
      </div>
    </div>
  )
}
