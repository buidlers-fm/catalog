import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params

  const { pinnedObjectId, pinnedObjectType } = reqJson

  // validate
  if (!pinnedObjectId || !pinnedObjectType) {
    const errorMsg = "pinnedObjectId and pinnedObjectType are required."
    return NextResponse.json({ error: errorMsg }, { status: 400 })
  }

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

  const finalUpdatePinPromises = orderedPinnedObjectIds.map((pinnedObjectId, idx) =>
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

  await prisma.$transaction([...tempUpdatePinPromises, ...finalUpdatePinPromises])

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

    const allPins = await prisma.pin.findMany({
      where: {
        pinnerId: userProfile.id,
      },
      orderBy: {
        sortOrder: "asc",
      },
    })

    const pinToDelete = allPins.find(
      (pin) => pin.pinnedObjectType === pinnedObjectType && pin.pinnedObjectId === pinnedObjectId,
    )
    if (!pinToDelete) {
      return NextResponse.json({ error: "Pin not found" }, { status: 404 })
    }

    const remainingPins = allPins.filter(
      (pin) =>
        !(pin.pinnedObjectType === pinnedObjectType && pin.pinnedObjectId === pinnedObjectId),
    )

    const deletePinPromise = prisma.pin.deleteMany({
      where: {
        pinnerId: userProfile.id,
        pinnedObjectId,
        pinnedObjectType,
      },
    })

    // reassign sortOrder values (in 2 separate updates, to get around sort_order uniqueness constraint)
    const sortOrderOffset = allPins.length
    const tempUpdatePinPromises = remainingPins.map((remainingPin, idx) =>
      prisma.pin.update({
        where: {
          id: remainingPin.id,
        },
        data: {
          sortOrder: idx + 1 + sortOrderOffset,
        },
      }),
    )

    const finalUpdatePinPromises = remainingPins.map((remainingPin, idx) =>
      prisma.pin.update({
        where: {
          id: remainingPin.id,
        },
        data: {
          sortOrder: idx + 1,
        },
      }),
    )

    await prisma.$transaction([
      deletePinPromise,
      ...tempUpdatePinPromises,
      ...finalUpdatePinPromises,
    ])

    return NextResponse.json({}, { status: 200 })
  },
  { requireJsonBody: false },
)
