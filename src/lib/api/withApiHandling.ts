import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import prisma from "lib/prisma"
import type { NextRequest } from "next/server"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

type Options = {
  requireSession?: boolean
  requireUserProfile?: boolean
  requireJsonBody?: boolean
}

const defaults = {
  requireSession: true,
  requireUserProfile: true,
  requireJsonBody: true,
}

export function withApiHandling(requestHandler, options: Options = defaults) {
  return async (req: NextRequest, { params: routeParams }) => {
    try {
      const { requireSession, requireUserProfile, requireJsonBody } = { ...defaults, ...options }

      // auth check
      const supabase = createRouteHandlerClient(
        { cookies },
        { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
      )
      const { data, error: supabaseError } = await supabase.auth.getSession()
      if (supabaseError) throw supabaseError

      const { session } = humps.camelizeKeys(data)
      if (!session && requireSession) throw new Error("No session found")

      let currentUserProfile
      if (session) {
        currentUserProfile = await prisma.userProfile.findFirst({
          where: { userId: session.user.id },
        })
      }
      if (!currentUserProfile && requireUserProfile) throw new Error("User profile not found")

      let reqJson = {}
      if (requireJsonBody) {
        reqJson = humps.camelizeKeys(await req.json())
      }

      const params = { routeParams, reqJson, currentUserProfile, session }
      const res = await requestHandler(req, { params })

      return res
    } catch (error: any) {
      console.log(error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }
}
