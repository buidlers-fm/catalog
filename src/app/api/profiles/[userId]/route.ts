import { NextResponse } from "next/server"
import humps from "humps"
import { uploadAvatar, deleteAvatar } from "lib/server/supabaseStorage"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { createList, updateList } from "lib/api/lists"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { routeParams } = params
    const { userId } = routeParams

    const userProfile = await prisma.userProfile.findFirst({
      where: {
        userId,
      },
    })

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    const resBody = humps.decamelizeKeys(userProfile)

    return NextResponse.json(resBody, { status: 200 })
  },
  {
    requireSession: false,
    requireUserProfile: false,
    requireJsonBody: false,
  },
)

export const PATCH = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { routeParams, session } = params
    const { userId } = routeParams

    const sessionUserId = session.user.id

    if (sessionUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // proceed with update
    const formData = await req.formData()
    const json = formData.get("data") as string
    const {
      userProfile: profileToUpdate,
      books: profileBooks,
      options,
    } = humps.camelizeKeys(JSON.parse(json))

    // handle avatar updates
    const avatarBlob = formData.get("avatarFile") as Blob | null

    const existingProfile = await prisma.userProfile.findFirst({
      where: {
        userId,
      },
    })

    if (!existingProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    if ((avatarBlob || options.avatarDeleted) && existingProfile.avatarUrl) {
      await deleteAvatar(existingProfile.avatarUrl)

      profileToUpdate.avatarUrl = null
    }

    if (avatarBlob) {
      const { avatarMimeType, avatarExtension } = options

      const uploadedAvatarUrl = await uploadAvatar(avatarBlob, { avatarMimeType, avatarExtension })

      profileToUpdate.avatarUrl = uploadedAvatarUrl
    }

    // prepare user profile record
    const { displayName, location, website, bio, avatarUrl } = profileToUpdate

    const fieldsToUpdate = {
      displayName,
      location,
      website,
      bio,
      avatarUrl,
    }

    const updateProfileRes = await prisma.userProfile.update({
      where: { userId },
      data: fieldsToUpdate,
    })

    const updatedProfile = humps.decamelizeKeys(updateProfileRes)

    // if books have been changed AND list exists, get its id and update it
    if (options.favoriteBooksUpdated) {
      const existingBooksList = await prisma.list.findFirst({
        where: {
          ownerId: updatedProfile.id,
          designation: "favorite",
        },
      })

      if (existingBooksList) {
        const listParamsToUpdate = {
          books: profileBooks,
        }
        await updateList(existingBooksList, listParamsToUpdate, updatedProfile)
      } else {
        const booksList = {
          title: "_favorite",
          slug: "_favorite",
          designation: "favorite",
          books: profileBooks,
        }

        await createList(booksList, updatedProfile)
      }
    }

    return NextResponse.json(updatedProfile, { status: 200 })
  },
  { requireJsonBody: false },
)
