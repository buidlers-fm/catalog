import humps from "humps"
import prisma from "lib/prisma"
import SignUpForm from "app/components/nav/SignUpForm"
import FeatureFlag from "enums/FeatureFlag"
import type { Metadata } from "next"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "catalog • sign up",
  openGraph: {
    title: "catalog • sign up",
  },
}

export default async function SignUpPage({ searchParams }) {
  const { inviteCode } = humps.camelizeKeys(searchParams)

  const invitesFeatureFlag = await prisma.featureFlag.findFirst({
    where: {
      name: FeatureFlag.RequireInvites,
    },
  })

  if (invitesFeatureFlag?.enabled) {
    if (!inviteCode) {
      return <ErrorPage errorMessage="You need an invite code to sign up!" />
    }

    const invite = await prisma.userInvite.findFirst({
      where: {
        code: inviteCode,
      },
      include: {
        claims: true,
      },
    })

    if (!invite) {
      return <ErrorPage errorMessage="Invalid invite code." />
    }

    if (!invite.expiresAt && invite.claims.length > 0) {
      return <ErrorPage errorMessage="This invite has already been claimed." />
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return <ErrorPage errorMessage="This invite has expired." />
    }
  }

  return (
    <div className="max-w-sm mx-auto font-mulish">
      <h1 className="cat-page-title my-12">sign up</h1>
      <SignUpForm inviteCode={inviteCode} />
    </div>
  )
}

function ErrorPage({ errorMessage }) {
  return <div className="py-32 px-8 text-center text-xl">{errorMessage}</div>
}
