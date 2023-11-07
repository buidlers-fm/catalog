import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import humps from "humps"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { PrismaClient } from "@prisma/client"
import type { NextRequest } from "next/server"

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // auth check
    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )
    const { data, error: supabaseError } = await supabase.auth.getSession()
    if (supabaseError) throw supabaseError

    const { session } = humps.camelizeKeys(data)
    if (!session) throw new Error("No session found")

    // fetch profile by id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    const { pinnedObjectId, pinnedObjectType } = humps.camelizeKeys(await req.json())

    // verify pinned object exists and belongs to the user
    if (pinnedObjectType === "list") {
      const pinnedObject = await prisma.list.findUnique({
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
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // auth check
    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )
    const { data, error: supabaseError } = await supabase.auth.getSession()
    if (supabaseError) throw supabaseError

    const { session } = humps.camelizeKeys(data)
    if (!session) throw new Error("No session found")

    // fetch profile by id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    const { orderedPinnedObjects } = humps.camelizeKeys(await req.json())
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
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const params = req.nextUrl.searchParams

  try {
    // auth check
    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseKey: SUPABASE_SERVICE_ROLE_KEY },
    )
    const { data, error: supabaseError } = await supabase.auth.getSession()
    if (supabaseError) throw supabaseError

    const { session } = humps.camelizeKeys(data)
    if (!session) throw new Error("No session found")

    // fetch profile by id
    const userProfile = await prisma.userProfile.findUnique({ where: { userId: session.user.id } })
    if (!userProfile) throw new Error("User profile not found")

    const pinnedObjectId = params.get("pinned_object_id")
    const pinnedObjectType = params.get("pinned_object_type")

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
  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
