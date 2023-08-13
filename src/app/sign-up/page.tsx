"use client"

import { toast } from "react-hot-toast"
import FormInput from "app/components/forms/FormInput"

export default function SignUp() {
  const showToast = (toastType: string) => {
    if (toastType === "success") {
      toast.success("You signed up!")
    } else if (toastType === "error") {
      toast.error("Oh no!")
    } else if (toastType === "loading") {
      toast.loading("Hmmm...")
    }
  }

  return (
    <div>
      <FormInput labelText="Email address" name="email" type="email" />
      <FormInput labelText="Username" name="username" type="text" />
      <FormInput labelText="Password" name="password" type="password" />
      <button className="cat-btn cat-btn-orange" onClick={() => showToast("success")}>
        Sign up
      </button>
    </div>
  )
}
