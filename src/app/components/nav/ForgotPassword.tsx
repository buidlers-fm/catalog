"use client"

import { useState } from "react"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useUser()
  const [email, setEmail] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [successMessage, setSuccessMessage] = useState<string>()

  const validateInput = () => {
    if (!email) {
      throw new Error("Enter an email.")
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    try {
      validateInput()
      await sendPasswordResetEmail(email)

      setSuccessMessage(
        "Password reset request submitted! Check your email for a link to reset your password.",
      )
    } catch (error: any) {
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="my-8">
      {successMessage ? (
        <div className="my-24">{successMessage}</div>
      ) : (
        <div>
          <div className="mb-8">
            We'll send a password reset link to your email address, if an account exists for that
            email.
          </div>
          <FormInput
            labelText="email address"
            name="email"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <button
            className="cat-btn cat-btn-gold cat-btn-sm"
            onClick={handleSubmit}
            disabled={isSubmitting || !email}
          >
            Submit
          </button>
          {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
        </div>
      )}
    </div>
  )
}
