import { notFound, redirect } from "next/navigation"
import { validate as isValidUuid } from "uuid"
import prisma from "lib/prisma"
import { getMetadata } from "lib/server/metadata"
import { getListLink } from "lib/helpers/general"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.list",
    params,
  })
}

export default async function ListPageById({ params }) {
  const { listId } = params

  if (!isValidUuid(listId)) notFound()

  const list = await prisma.list.findFirst({
    where: {
      id: listId,
    },
    include: {
      creator: true,
    },
  })

  if (!list) notFound()

  const { slug } = list

  redirect(getListLink(list.creator, slug))
}
