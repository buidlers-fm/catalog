import { NextResponse } from "next/server"
import humps from "humps"
import prisma from "lib/prisma"
import { withApiHandling } from "lib/api/withApiHandling"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"
import type { NextRequest } from "next/server"

export const POST = withApiHandling(async (_req: NextRequest, { params }) => {
  const { reqJson, currentUserProfile: userProfile } = params
  const { savedObjectId, savedObjectType } = reqJson
  const createParams = {
    agentId: userProfile.id,
    agentType: InteractionAgentType.User,
    interactionType: InteractionType.Save,
    objectId: savedObjectId,
    objectType: savedObjectType,
  }

  // upsert is used for findOrCreate in prisma
  // passing an empty object in the update param will make no changes if the record exists
  // https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-or-create-records
  const save = await prisma.interaction.upsert({
    where: { agentId_agentType_interactionType_objectId_objectType: createParams },
    create: createParams,
    update: {},
  })

  const resBody = humps.decamelizeKeys(save)

  return NextResponse.json(resBody, { status: 200 })
})
