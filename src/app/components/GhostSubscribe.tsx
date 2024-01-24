"use client"

import { useEffect } from "react"

export default function GhostSubscribe() {
  useEffect(() => {
    const script = document.createElement("script")

    script.src = "https://cdn.jsdelivr.net/ghost/signup-form@~0.1/umd/signup-form.min.js"
    script.async = true

    script.dataset.buttonColor = "hsl(45, 100%, 55%)"
    script.dataset.buttonTextColor = "hsl(45, 4%, 12%)"
    script.dataset.site = "https://catalogfyi.ghost.io/"
    const el = document.getElementById("ghost-signup")
    el?.appendChild(script)

    return () => {
      el?.removeChild(script)
    }
  }, [])

  return (
    <div
      id="ghost-signup"
      className="mx-auto"
      style={{
        minHeight: "58px",
        maxWidth: "340px",
        width: "100%",
      }}
    />
  )
}
