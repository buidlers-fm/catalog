import { redirect } from "next/navigation"
import { getUserShelvesLink } from "lib/helpers/general"

export const dynamic = "force-dynamic"

export default async function UserShelvesPage({ params }) {
  const { username } = params
  redirect(`${getUserShelvesLink(username)}/to-read`)
}
