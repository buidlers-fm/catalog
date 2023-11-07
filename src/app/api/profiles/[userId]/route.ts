import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import humps from "humps"
import { v4 as uuidv4 } from "uuid"
import { StorageClient } from "@supabase/storage-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import { withApiHandling } from "lib/api/withApiHandling"
import { createList, updateList } from "lib/api/lists"
import type { NextRequest } from "next/server"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const storageUrl = `${SUPABASE_URL}/storage/v1`
const storageBucketPath = `${storageUrl}/object/public/assets`
const storageClient = new StorageClient(storageUrl, {
  apikey: SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
})

const prisma = new PrismaClient()

export const PATCH = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { routeParams, session } = params
    const { userId } = routeParams

    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )

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

    console.log(profileToUpdate)

    // handle avatar updates
    const avatarBlob = formData.get("avatarFile") as Blob | null

    if ((avatarBlob || options.avatarDeleted) && profileToUpdate.avatarUrl) {
      const filePath = profileToUpdate.avatarUrl.split("/assets/").pop()

      const { error: avatarDeleteError } = await supabase.storage.from("assets").remove(filePath)

      if (avatarDeleteError) throw new Error(`Error uploading avatar: ${avatarDeleteError.message}`)

      profileToUpdate.avatarUrl = null
    }

    if (avatarBlob) {
      const { avatarMimeType, avatarExtension } = options
      const avatarUuid = uuidv4()
      const fileDir = "user_profiles/avatars"
      const filePath = `${fileDir}/${avatarUuid}.${avatarExtension}`
      console.log(filePath, avatarMimeType)
      const { error: avatarUploadError } = await storageClient
        .from("assets")
        .upload(filePath, avatarBlob, { contentType: avatarMimeType })

      if (avatarUploadError) throw new Error(`Error uploading avatar: ${avatarUploadError.message}`)

      profileToUpdate.avatarUrl = `${storageBucketPath}/${filePath}`
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
