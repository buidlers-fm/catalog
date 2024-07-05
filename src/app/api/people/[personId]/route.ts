import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { uploadPersonImage, deletePersonImage } from "lib/server/supabaseStorage"
import { withApiHandling } from "lib/api/withApiHandling"
import EditType from "enums/EditType"
import EditedObjectType from "enums/EditedObjectType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { routeParams, currentUserProfile } = params
    const { personId } = routeParams

    const person = await prisma.person.findFirst({
      where: {
        id: personId,
      },
    })

    if (!person) {
      return NextResponse.json({ error: "Person not found" }, { status: 404 })
    }

    // unpack form data
    const formData = await req.formData()
    const json = formData.get("data") as string
    const { person: reqJson, options } = humps.camelizeKeys(JSON.parse(json))

    // handle image updates
    const imageBlob = formData.get("imageFile") as Blob | null

    let newImageUrl
    let originalImageUrl

    if ((imageBlob || options.imageDeleted) && person.imageUrl) {
      if (person.imageUrl.match(/supabase/)) {
        await deletePersonImage(person.imageUrl)
      }

      newImageUrl = null
    }

    if (imageBlob) {
      const { imageMimeType, imageExtension } = options

      const uploadedImageUrl = await uploadPersonImage(imageBlob, {
        personId,
        personSlug: person.slug,
        mimeType: imageMimeType,
        extension: imageExtension,
        replace: true,
      })

      newImageUrl = uploadedImageUrl
      originalImageUrl = null // since image comes from user, there is no "source" url
    }

    const { name, bio, location, website, instagram, tiktok, bluesky, twitter, wikipediaUrl } =
      reqJson

    const fieldsToUpdate = {
      name,
      bio,
      location,
      website,
      instagram,
      tiktok,
      bluesky,
      twitter,
      wikipediaUrl,
      imageUrl: newImageUrl,
      originalImageUrl,
    }

    const changedFields: string[] = []
    Object.keys(fieldsToUpdate).forEach((key) => {
      if (key === "originalImageUrl") return

      if (person[key] !== fieldsToUpdate[key]) {
        changedFields.push(key)
      }
    })

    if (changedFields.length === 0) {
      return NextResponse.json(reqJson, { status: 200 })
    }

    const updatedPerson = await prisma.person.update({
      where: {
        id: personId,
      },
      data: {
        ...fieldsToUpdate,
        edited: true,
      },
    })

    // create edit logs
    await prisma.editLog.create({
      data: {
        editorId: currentUserProfile.id,
        editedObjectId: personId,
        editedObjectType: EditedObjectType.Person,
        editType: EditType.Update,
        beforeJson: person,
        afterJson: updatedPerson,
        editedFields: changedFields,
      },
    })

    const resBody = humps.decamelizeKeys(updatedPerson)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false },
)
