import { redirect } from "next/navigation"
import { getMetadata } from "lib/server/metadata"
import { getUserShelvesLink } from "lib/helpers/general"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "profile.shelves",
    params,
  })
}

export default async function UserShelvesPage({ params }) {
  const { username } = params
  redirect(`${getUserShelvesLink(username)}/to-read`)
}
