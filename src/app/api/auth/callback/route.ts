import { redirect } from "next/navigation"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")

  if (error) {
    if (error === "unauthorized_client") {
      return NextResponse.json("This link is invalid or has expired. Try again.")
    } else {
      throw new Error(error)
    }
  }

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
    return redirect("/settings/password")
  } else {
    throw new Error("No password reset code")
  }
}
