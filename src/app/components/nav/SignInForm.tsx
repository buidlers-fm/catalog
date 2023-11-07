"use client"

import { useState } from "react"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function SignInForm({ toggleAuth }) {
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
      await signIn(email, password)
    } catch (error: any) {
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div>
      <FormInput
        labelText="Email address"
        name="email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <FormInput
        labelText="Password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button className="cat-btn cat-btn-teal my-4" onClick={handleSubmit} disabled={isSubmitting}>
        Sign in
      </button>
      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
      <div>
        Don't have an account?{" "}
        <button onClick={toggleAuth} className="cat-btn-link text-teal-500">
          Sign up
        </button>
        .
      </div>
    </div>
  )
}
