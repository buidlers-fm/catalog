"use client"

import { Toaster } from "react-hot-toast"
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs"

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{
        bottom: 50,
        right: 40,
      }}
      toastOptions={{
        className: "!px-8 !bg-gray-900 !text-white",
        success: {
          icon: <BsCheckCircleFill className="text-green-500 text-lg" />,
          duration: 4000,
        },
        error: {
          icon: <BsXCircleFill className="text-red-500 text-lg" />,
          duration: 4000,
        },
      }}
    />
  )
}
