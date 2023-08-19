import { NextResponse } from "next/server"
import humps from "humps"
import { PrismaClient } from "@prisma/client"
import type { NextRequest } from "next/server"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams

  const filters: any = {}
  const filterParams = ["username", "email"]

  filterParams.forEach((filterParam) => {
    const value = params.get(filterParam)
    if (value) filters[filterParam] = value
  })

  const userProfilesRes = await prisma.userProfile.findMany({ where: filters })
  const resBody = humps.decamelizeKeys(userProfilesRes)

  return NextResponse.json(resBody, { status: 200 })
}
