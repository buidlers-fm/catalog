import { notFound, redirect } from "next/navigation"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import InteractionType from "enums/InteractionType"
import InteractionAgentType from "enums/InteractionAgentType"

const SavedPage = async () => {
  const currentUserProfile = await getCurrentUserProfile({ requireSignedIn: true })
  const isSignedIn = !!currentUserProfile

  if (!isSignedIn) redirect("/")

  const saves = await prisma.interaction.findMany({
    where: {
      interactionType: InteractionType.Save,
      agentId: currentUserProfile.id,
      agentType: InteractionAgentType.User,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!saves) notFound()

  // CHANGE ME
  return (
    <div className="flex justify-center items-center flex-col">
      {saves.map((save) => (
        <div key={save.id}>
          <span>Saved Object Type: {save.objectType}</span>
          <span>Saved Object ID: {save.objectId}</span>
        </div>
      ))}
    </div>
  )
}

export default SavedPage
