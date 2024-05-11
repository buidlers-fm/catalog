import { NextResponse } from "next/server"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import { reportToSentry } from "lib/sentry"
import { visibilitySettingsOptions } from "enums/Visibility"
import BookNoteType from "enums/BookNoteType"
import type { NextRequest } from "next/server"

export const PATCH = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile } = params
  const {
    hasNewAnnouncements,
    seenIntroTour,
    notesVisibility,
    shelvesVisibility,
    currentStatusVisibility,
    userSearchVisibility,
  } = reqJson

  const existingUserConfig = await prisma.userConfig.findFirst({
    where: {
      userProfileId: currentUserProfile.id,
    },
  })

  if (!existingUserConfig) {
    reportToSentry(new Error(`User config not found, creating now`), {
      reqJson,
      currentUserProfile,
    })

    await prisma.userConfig.create({
      data: {
        userProfileId: currentUserProfile.id,
        hasNewAnnouncements,
        seenIntroTour,
        notesVisibility,
        shelvesVisibility,
        currentStatusVisibility,
        userSearchVisibility,
      },
    })
  }

  let isNotesVisibilityChanged = false
  if (notesVisibility) {
    if (
      !Object.values(visibilitySettingsOptions.notesVisibility.options).includes(notesVisibility)
    ) {
      return NextResponse.json({ error: "Invalid notes visibility value" }, { status: 400 })
    }

    isNotesVisibilityChanged = existingUserConfig?.notesVisibility !== notesVisibility
  }

  if (
    shelvesVisibility &&
    !Object.values(visibilitySettingsOptions.shelvesVisibility.options).includes(shelvesVisibility)
  ) {
    return NextResponse.json({ error: "Invalid shelves visibility value" }, { status: 400 })
  }

  if (
    currentStatusVisibility &&
    !Object.values(visibilitySettingsOptions.currentStatusVisibility.options).includes(
      currentStatusVisibility,
    )
  ) {
    return NextResponse.json({ error: "Invalid current status visibility value" }, { status: 400 })
  }

  if (
    userSearchVisibility &&
    !Object.values(visibilitySettingsOptions.userSearchVisibility.options).includes(
      userSearchVisibility,
    )
  ) {
    return NextResponse.json({ error: "Invalid user search visibility value" }, { status: 400 })
  }

  const updateUserConfigQuery = prisma.userConfig.update({
    where: {
      userProfileId: currentUserProfile.id,
    },
    data: {
      hasNewAnnouncements,
      seenIntroTour,
      notesVisibility,
      shelvesVisibility,
      currentStatusVisibility,
      userSearchVisibility,
    },
  })

  const queries: any[] = [updateUserConfigQuery]

  // update visibility on all existing notes
  if (notesVisibility && isNotesVisibilityChanged) {
    const updateNotesQuery = prisma.bookNote.updateMany({
      where: {
        creatorId: currentUserProfile.id,
        noteType: BookNoteType.JournalEntry,
      },
      data: {
        visibility: notesVisibility,
      },
    })

    queries.push(updateNotesQuery)
  }

  await prisma.$transaction(queries)

  return NextResponse.json({}, { status: 200 })
})
