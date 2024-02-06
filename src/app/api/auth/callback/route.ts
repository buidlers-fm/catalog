import { redirect } from "next/navigation"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { reportToSentry } from "lib/sentry"
import type { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const errorParam = requestUrl.searchParams.get("error")

  if (errorParam) {
    if (errorParam === "unauthorized_client") {
      return NextResponse.json(
        "This link is invalid, expired, or has already been used. If you are trying to reset your password, try submitting a new password reset request from the sign-in screen.",
      )
    } else {
      reportToSentry(new Error(errorParam), {
        request,
        code,
        error: errorParam,
      })

      return NextResponse.json(
        "There was a problem redirecting you to the right place. If you are trying to reset your password, please contact us: staff@catalog.fyi",
      )
    }
  }

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error: any) {
      reportToSentry(error, {
        request,
        code,
      })

      if (error.message.includes("both auth code and code verifier")) {
        return NextResponse.json(
          "It seems you may be opening this link in a different device or browser than the one you requested the password reset from. Please try again from the same device or browser. If you are still having trouble, please contact us: staff@catalog.fyi",
        )
      } else {
        return NextResponse.json(
          "There was a problem redirecting you to the right place. If you are trying to reset your password, please contact us: staff@catalog.fyi",
        )
      }
    }

    return redirect("/settings/password")
  } else {
    reportToSentry(new Error("No code or error in callback from supabase"), {
      request,
    })

    return NextResponse.json(
      "There was a problem redirecting you to the right place. If you are trying to reset your password, please contact us: staff@catalog.fyi",
    )
  }
}
