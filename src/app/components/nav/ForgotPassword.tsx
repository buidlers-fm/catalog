"use client"

import { useState } from "react"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function ForgotPassword() {
  const { sendPasswordResetEmail } = useUser()
  const [email, setEmail] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()
  const [success, setSuccess] = useState<boolean>(false)

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

      setSuccess(true)
    } catch (error: any) {
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="my-8">
      {success ? (
        <div className="my-24">
          Password reset request submitted! Check your email for a link to reset your password. If
          you don't see the email, check your spam folder.
          <div className="mt-4">
            Note: The link must be opened in the same browser where you are viewing this page.
          </div>
          <div className="mt-4">
            If you still don't see the email or are having trouble resetting your password, please{" "}
            <a href="mailto:staff@catalog.fyi" className="underline">
              contact us
            </a>
            .
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-8">
            We'll send a password reset link to your email address, if an account exists for that
            email.
            <div className="mt-4">
              (For best results, submit this request <span className="italic">and</span> open the
              email link on a desktop or laptop computer, not a phone or tablet.)
            </div>
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
