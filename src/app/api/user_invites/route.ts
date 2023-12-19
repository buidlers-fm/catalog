import { NextResponse } from "next/server"
import humps from "humps"
import cryptoRandomString from "crypto-random-string"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import type { NextRequest } from "next/server"

export const GET = withApiHandling(
  async () => {
    const _allInvites = await prisma.userInvite.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        inviter: true,
        claimedByUser: true,
      },
    })

    const allClaimedByUserIds = _allInvites.map((invite) => invite.claimedByUserId).filter(Boolean)

    const allUserProfiles = await prisma.userProfile.findMany({
      where: {
        userId: {
          // @ts-ignore ts you are wrong, nulls are filtered out
          in: allClaimedByUserIds,
        },
      },
    })

    const userIdsToUserProfiles = allUserProfiles.reduce(
      (result, userProfile) => ({
        ...result,
        [userProfile.userId]: userProfile,
      }),
      {},
    )

    const allInvites = _allInvites.map((invite) => ({
      ...invite,
      claimedByUserProfile: invite.claimedByUserId
        ? userIdsToUserProfiles[invite.claimedByUserId]
        : undefined,
    }))

    const resBody = humps.decamelizeKeys(allInvites)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireAdmin: true },
)

export const POST = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { currentUserProfile } = params

    const code = cryptoRandomString({ length: 12 })

    const createdInvite = await prisma.userInvite.create({
      data: {
        code,
        inviter: {
          connect: {
            id: currentUserProfile.id,
          },
        },
      },
    })

    const resBody = humps.decamelizeKeys(createdInvite)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireAdmin: true },
)
