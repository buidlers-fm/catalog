"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"

export default function ResetPassword() {
  const router = useRouter()
  const { resetPassword } = useUser()

  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  function validateInput() {
    if (!password || !confirmPassword) {
      throw new Error("Enter a new password and password confirmation.")
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.")
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.")
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setErrorMessage(undefined)

    const toastId = toast.loading("Resetting password...")

    try {
      validateInput()

      await resetPassword(password)

      toast.success("Password reset successfully!", { id: toastId })
      router.push("/home")
    } catch (error: any) {
      toast.error("Hmm, something went wrong.", { id: toastId })
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="max-w-md mx-auto px-8">
      <div className="my-8 cat-page-title">reset password</div>

      <FormInput
        labelText="new password"
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <FormInput
        labelText="confirm new password"
        name="newPassword"
        type="password"
        onChange={(e) => setConfirmPassword(e.target.value)}
        value={confirmPassword}
      />

      <button
        className="cat-btn cat-btn-gold my-2"
        onClick={handleSubmit}
        disabled={isSubmitting || !password || !confirmPassword}
      >
        Reset password
      </button>

      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
    </div>
  )
}
