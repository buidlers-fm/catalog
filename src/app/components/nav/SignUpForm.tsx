"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import { useUser } from "contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function SignUpForm({ toggleAuth }) {
  const { signUp } = useUser()

  const [email, setEmail] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  const validatePassword = () => {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.")
    }
  }

  const validateInput = () => {
    if (!email || !username || !password) {
      throw new Error("All fields are required.")
    }

    validatePassword()
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setErrorMessage(undefined)

      validateInput()

      await signUp(email, username, password)

      toast.success("Signed up!")
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
        labelText="Username"
        name="username"
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
      />
      <FormInput
        labelText="Password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <button className="cat-btn cat-btn-orange" onClick={handleSubmit} disabled={isSubmitting}>
        Sign up
      </button>
      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
      <div>
        Already have an account?{" "}
        <button onClick={toggleAuth} className="cat-btn-link text-orange-500">
          Sign in
        </button>
        .
      </div>
    </div>
  )
}
