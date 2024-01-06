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
        claims: {
          include: {
            claimedByUser: true,
          },
        },
      },
    })

    const allClaimedByUserIds = _allInvites
      .map((invite) => invite.claims)
      .flat()
      .map((claim) => claim.claimedByUserId)

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
      claimedByUserProfiles: invite.claims.map(
        (claim) => userIdsToUserProfiles[claim.claimedByUserId],
      ),
    }))

    const resBody = humps.decamelizeKeys(allInvites)

    return NextResponse.json(resBody, { status: 200 })
  },
  { requireJsonBody: false, requireAdmin: true },
)

export const POST = withApiHandling(
  async (_req: NextRequest, { params }) => {
    const { reqJson, currentUserProfile } = params

    const { singleUse } = reqJson

    const code = cryptoRandomString({ length: 12 })

    const _30_DAYS_MS = 1000 * 60 * 60 * 24 * 30

    const createdInvite = await prisma.userInvite.create({
      data: {
        code,
        expiresAt: singleUse ? undefined : new Date(Date.now() + _30_DAYS_MS),
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
  { requireAdmin: true },
)
