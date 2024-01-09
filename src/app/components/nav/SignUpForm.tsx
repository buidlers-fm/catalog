"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { getUserProfileLink } from "lib/helpers/general"
import { useUser } from "lib/contexts/UserContext"
import FormInput from "app/components/forms/FormInput"
import FormCheckbox from "app/components/forms/FormCheckbox"

export default function SignUpForm({
  toggleAuth,
  onSuccess,
  inviteCode,
}: {
  toggleAuth?: () => void
  onSuccess?: (currentUserProfile) => void
  inviteCode?: string
}) {
  const router = useRouter()
  const { signUp } = useUser()

  const [email, setEmail] = useState<string>("")
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [isSubscribeChecked, setIsSubscribeChecked] = useState<boolean>(false)
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

      const { currentUserProfile } = await signUp(email, username, password, {
        inviteCode,
        subscribe: isSubscribeChecked,
      })

      toast.success("Signed up! Navigating to your profile...")

      if (onSuccess) {
        onSuccess(currentUserProfile)
      }

      await router.push(getUserProfileLink(username))
      router.refresh()
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
        accentColor="teal"
      />
      <FormInput
        labelText="username"
        descriptionText="Choose a username between 3 and 30 characters, that contains only letters, numbers, dashes (-), and underscores (_)."
        name="username"
        type="text"
        onChange={(e) => setUsername(e.target.value)}
        value={username}
        accentColor="teal"
      />
      <FormInput
        labelText="password"
        descriptionText="Choose a password at least 8 characters long."
        name="password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        accentColor="teal"
      />
      <FormCheckbox
        name="subscribe"
        isChecked={isSubscribeChecked}
        onChange={setIsSubscribeChecked}
        labelText="Subscribe me to catalog news. (Sent out every 1-2 months or so.)"
        textColor="text-teal-500"
        focusColor="focus:ring-teal-500"
      />
      <button className="cat-btn cat-btn-teal my-4" onClick={handleSubmit} disabled={isSubmitting}>
        Sign up
      </button>
      {errorMessage && <div className="my-3 text-red-500">{errorMessage}</div>}
      {toggleAuth && (
        <div>
          Already have an account?{" "}
          <button onClick={toggleAuth} className="cat-link text-gold-500">
            Sign in
          </button>
          .
        </div>
      )}
    </div>
  )
}
