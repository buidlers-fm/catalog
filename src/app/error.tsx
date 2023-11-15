"use client"

export default function ErrorPage({ error }) {
  console.log(error)
  return (
    <div className="py-32 px-8 text-center text-xl">
      Oops! Something went wrong:
      <div className="my-2 text-red-500 font-mulish">{error.message}</div>
    </div>
  )
}
