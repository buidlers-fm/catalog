"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"
import AuthForm from "enums/AuthForm"

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
        router.push("/home")
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
      <button
        className="cat-btn cat-btn-gold my-2"
        onClick={handleSubmit}
        disabled={isSubmitting || !email || !password}
      >
        Sign in
      </button>
      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}

      <div className="mt-4 mb-6 text-sm">
        <button onClick={() => toggleAuth(AuthForm.ForgotPassword)} className="cat-link">
          forgot password?
        </button>
      </div>

      {/* disabling general sign up */}
      <div className="hidden">
        Don't have an account?{" "}
        <button
          onClick={() => toggleAuth(AuthForm.SignUp)}
          className="cat-link text-none text-teal-500"
        >
          Sign up
        </button>
        .
      </div>
      {/* end disabled general sign up */}
      <div className="mt-4 text-sm text-gray-300">
        catalog is in closed alpha. Sign up for the waitlist{" "}
        <a href="https://tally.so/r/mZ20aA" className="cat-link">
          here
        </a>
        .
      </div>
    </div>
  )
}
