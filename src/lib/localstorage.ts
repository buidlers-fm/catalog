import { reportToSentry } from "lib/sentry"

function setLocalStorage(key, value) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    reportToSentry(error, {
      method: "setLocalStorage",
      key,
      value,
    })
  }
}

function getLocalStorage(key) {
  if (typeof window === "undefined") return
  return JSON.parse(window.localStorage.getItem(key) as any)
}

function deleteLocalStorage(key) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    reportToSentry(error, {
      method: "deleteLocalStorage",
      key,
    })
  }
}

export { setLocalStorage, getLocalStorage, deleteLocalStorage }
