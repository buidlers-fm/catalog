import Link from "next/link"
import { notFound } from "next/navigation"
import { TiWarningOutline } from "react-icons/ti"
import prisma from "lib/prisma"
import { getCurrentUserProfile } from "lib/server/auth"
import { getPersonLinkWithSlug } from "lib/helpers/general"
import EditPersonTabs from "app/people/[personSlug]/edit/components/EditPersonTabs"

export const dynamic = "force-dynamic"

export default async function EditPersonLayout({ params, children }) {
  const { personSlug } = params

  await getCurrentUserProfile({
    requireSignedIn: true,
    redirectPath: getPersonLinkWithSlug(personSlug),
  })

  const person = await prisma.person.findFirst({
    where: {
      slug: personSlug,
    },
  })

  if (!person) notFound()

  return (
    <div className="my-8 mx-8 sm:mx-16 ml:max-w-3xl ml:mx-auto font-mulish">
      <div className="mt-8 mb-4 cat-page-title">
        edit{" "}
        <Link href={getPersonLinkWithSlug(personSlug)} className="underline">
          {person.name}
        </Link>{" "}
      </div>
      <div className="text-gray-300 text-sm">
        <TiWarningOutline className="inline-block -mt-1 mr-1 text-lg text-gold-500" />
        Make sure to save your changes before you switch tabs.
      </div>
      <div className="my-8 max-w-xl">
        <EditPersonTabs person={person} />
      </div>
      {children}
    </div>
  )
}
