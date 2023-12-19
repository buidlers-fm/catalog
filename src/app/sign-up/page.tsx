import humps from "humps"
import prisma from "lib/prisma"
import SignUpForm from "app/components/nav/SignUpForm"

export default async function SignUpPage({ searchParams }) {
  const { inviteCode } = humps.camelizeKeys(searchParams)

  if (!inviteCode) {
    return <ErrorPage errorMessage="You need an invite code to sign up!" />
  }

  const invite = await prisma.userInvite.findFirst({
    where: {
      code: inviteCode,
    },
  })

  if (!invite) {
    return <ErrorPage errorMessage="Invalid invite code." />
  }

  if (invite.claimedAt) {
    return <ErrorPage errorMessage="This invite has already been claimed." />
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
