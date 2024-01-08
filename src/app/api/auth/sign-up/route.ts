import { NextResponse } from "next/server"
import humps from "humps"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import * as ghost from "lib/ghost"
import { isProduction } from "lib/helpers/general"
import FeatureFlag from "enums/FeatureFlag"
import type { NextRequest } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 30
const PASSWORD_MIN_LENGTH = 8

export const POST = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { reqJson } = params
    const { email, username, password, inviteCode, subscribe } = reqJson

    let matchingInvite
    const invitesFeatureFlag = await prisma.featureFlag.findFirst({
      where: {
        name: FeatureFlag.RequireInvites,
      },
    })

    if (invitesFeatureFlag?.enabled) {
      // validate invite code
      if (!inviteCode) {
        return NextResponse.json({ error: "Invite code is required." }, { status: 400 })
      }

      matchingInvite = await prisma.userInvite.findFirst({
        where: {
          code: inviteCode,
        },
        include: {
          claims: true,
        },
      })

      if (!matchingInvite) {
        return NextResponse.json({ error: "Invite code is invalid." }, { status: 400 })
      }

      // a non-expiring invite can only be claimed once
      if (!matchingInvite.expiresAt && matchingInvite.claims.length > 0) {
        return NextResponse.json({ error: "Invite has already been claimed." }, { status: 400 })
      }

      if (matchingInvite.expiresAt && matchingInvite.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invite has expired." }, { status: 400 })
      }
    }

    // validations
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Email, username, and password must all be present." },
        { status: 400 },
      )
    }

    const matchingUsersCount = await prisma.user.count({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    })
    if (matchingUsersCount > 0) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 400 },
      )
    }

    const matchingProfilesCount = await prisma.userProfile.count({
      where: {
        username: {
          equals: username,
          mode: "insensitive",
        },
      },
    })
    if (matchingProfilesCount > 0) {
      return NextResponse.json(
        { error: "An account with that username already exists." },
        { status: 400 },
      )
    }

    const validUsernameRegex = /^[a-zA-Z0-9_-]+$/
    const isUsernameValid = username.match(validUsernameRegex)
    if (!isUsernameValid) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, dashes (-), and underscores (_)." },
        { status: 400 },
      )
    }

    if (username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters." },
        { status: 400 },
      )
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      )
    }

    // create supabase-auth user
    const { data, error: supabaseAuthError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    })

    if (supabaseAuthError) {
      throw supabaseAuthError
    }

    console.log(data)

    const userId = data.user!.id

    // create app user and profile
    const createUserRes = await prisma.user.create({
      data: {
        id: userId,
        email,
        profile: {
          create: {
            username,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    console.log(createUserRes)

    // create invite claim
    if (invitesFeatureFlag?.enabled && matchingInvite) {
      await prisma.userInviteClaim.create({
        data: {
          inviteId: matchingInvite.id,
          claimedByUserId: createUserRes.id,
        },
      })
    }

    // seed book lists
    const startingLists = [
      {
        title: "_favorite",
        slug: "_favorite",
        designation: "favorite",
      },
      {
        title: "_read",
        slug: "_read",
        designation: "read",
      },
    ]

    await prisma.list.createMany({
      data: startingLists.map((list) => ({
        ...list,
        creatorId: createUserRes.profile!.id,
        ownerId: createUserRes.profile!.id,
      })),
    })

    // subscribe to newsletter
    if (subscribe && isProduction()) {
      try {
        await ghost.subscribe(email)
        console.log(`signup: Subscribed ${email} to Ghost.`)
      } catch (error: any) {
        reportToSentry(error, {
          method: "ghost.subscribe",
          email,
        })
      }
    }

    const resData = {
      email,
      username,
      userId,
    }

    const resBody = humps.decamelizeKeys(resData)
    return NextResponse.json(resBody, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
  },
)
