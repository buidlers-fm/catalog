"use client"

export const dynamic = "force-dynamic"

export default function AdminThrowPage() {
  function throwError() {
    throw new Error("oh no!")
  }

  return (
    <div className="my-8 flex justify-center mx-auto font-mulish">
      <button onClick={throwError} className="cat-btn cat-btn-red mx-auto">
        throw
      </button>
    </div>
  )
}
