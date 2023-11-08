import { NextResponse } from "next/server"
import humps from "humps"
import { PrismaClient } from "@prisma/client"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

const prisma = new PrismaClient()

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params

  const { pinnedObjectId, pinnedObjectType } = reqJson

  // verify pinned object exists and belongs to the user
  if (pinnedObjectType === "list") {
    const pinnedObject = await prisma.list.findFirst({
      where: {
        id: pinnedObjectId,
      },
    })

    if (!pinnedObject) {
      const errorMsg = "Pinned object not found"
      return NextResponse.json({ error: errorMsg }, { status: 404 })
    }

    if (pinnedObject?.ownerId !== userProfile.id) {
      const errorMsg = "You are not authorized to pin this object"
      return NextResponse.json({ error: errorMsg }, { status: 403 })
    }
  } else {
    const errorMsg = `Can't pin object of type: ${pinnedObjectType}`
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  // check if object is already pinned
  const existingPins = await prisma.pin.findMany({
    where: {
      pinnerId: userProfile.id,
    },
    orderBy: {
      sortOrder: "desc",
    },
  })

  const isAlreadyPinned = existingPins.find(
    (pin) => pin.pinnedObjectId === pinnedObjectId && pin.pinnedObjectType === pinnedObjectType,
  )
  if (isAlreadyPinned) {
    const errorMsg = "Object is already pinned"
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  // create pin
  const lastPin = existingPins[0]
  const sortOrder = (lastPin?.sortOrder || 0) + 1

  const createdPin = await prisma.pin.create({
    data: {
      pinnerId: userProfile.id,
      pinnedObjectId,
      pinnedObjectType,
      sortOrder,
    },
  })

  const resBody = humps.decamelizeKeys(createdPin)

  return NextResponse.json(resBody, { status: 200 })
})

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params

  const { orderedPinnedObjects } = reqJson
  const orderedPinnedObjectIds = orderedPinnedObjects.map((obj) => obj.id)

  // verify the input array matches the existing pins, except for order
  const existingPinnedObjectIds = (
    await prisma.pin.findMany({
      where: {
        pinnerId: userProfile.id,
      },
    })
  )
    .map((pin) => pin.pinnedObjectId)
    .sort()

  const sameLength = orderedPinnedObjectIds.length === existingPinnedObjectIds.length
  const sameItems = [...orderedPinnedObjectIds]
    .sort()
    .every((value, idx) => value === existingPinnedObjectIds[idx])

  if (!sameLength || !sameItems) {
    const errorMsg = "Input array of pinned object ids doesn't match the set of existing pins"
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

  // reassign sortOrder values (in 2 separate updates, to get around sort_order uniqueness constraint)
  const sortOrderOffset = orderedPinnedObjectIds.length
  const tempUpdatePinPromises = orderedPinnedObjectIds.map((pinnedObjectId, idx) =>
    prisma.pin.updateMany({
      where: {
        pinnerId: userProfile.id,
        pinnedObjectId,
      },
      data: {
        sortOrder: idx + 1 + sortOrderOffset,
      },
    }),
  )

  await Promise.all(tempUpdatePinPromises)

  const updatePinPromises = orderedPinnedObjectIds.map((pinnedObjectId, idx) =>
    prisma.pin.updateMany({
      where: {
        pinnerId: userProfile.id,
        pinnedObjectId,
      },
      data: {
        sortOrder: idx + 1,
      },
    }),
  )

  await Promise.all(updatePinPromises)

  return NextResponse.json({}, { status: 200 })
})

export const DELETE = withApiHandling(
  async (req: NextRequest, { params }) => {
    const { currentUserProfile: userProfile } = params
    const deleteParams = req.nextUrl.searchParams

    const pinnedObjectId = deleteParams.get("pinned_object_id")
    const pinnedObjectType = deleteParams.get("pinned_object_type")

    if (!pinnedObjectId || !pinnedObjectType) {
      const errorMsg = "Missing pinned_object_id or pinned_object_type"
      return NextResponse.json({ error: errorMsg }, { status: 400 })
    }

    // delete pin(s)
    await prisma.pin.deleteMany({
      where: {
        pinnerId: userProfile.id,
        pinnedObjectId,
        pinnedObjectType,
      },
    })

    // reassign sortOrder values of remaining pins
    const remainingPins = await prisma.pin.findMany({
      where: {
        pinnerId: userProfile.id,
      },
      orderBy: {
        sortOrder: "asc",
      },
    })

    const updatePinPromises = remainingPins.map((remainingPin, idx) =>
      prisma.pin.update({
        where: {
          id: remainingPin.id,
        },
        data: {
          sortOrder: idx + 1,
        },
      }),
    )

    await Promise.all(updatePinPromises)

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
