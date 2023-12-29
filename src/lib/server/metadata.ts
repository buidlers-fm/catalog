import prisma from "lib/prisma"
import { reportToSentry } from "lib/sentry"
import UserProfile from "lib/models/UserProfile"
import type { Metadata } from "next"

const METADATA_CONFIG = {
  profile: {
    title: (name) => `${name}'s profile • catalog`,
  },
  "profile.lists": {
    title: (name) => `${name}'s lists • catalog`,
  },
  "profile.notes": {
    title: (name) => `${name}'s notes • catalog`,
  },
  "profile.shelves": {
    title: (name) => `${name}'s shelves • catalog`,
  },
  "profile.shelves.shelf": {
    title: (name, shelf) => `${name}'s ${shelf} shelf • catalog`,
  },
  "profile.followers": {
    title: (name) => `${name}'s followers • catalog`,
  },
  "profile.following": {
    title: (name) => `${name}'s friends • catalog`,
  },
  "profile.list": {
    title: (name, listTitle) => `${listTitle}, a list by ${name} • catalog`,
  },
  "profile.list.edit": {
    title: (name, listTitle) => `edit ${listTitle} • catalog`,
  },
  book: {
    title: (title, authorName) => `${title} by ${authorName} • catalog`,
  },
  "book.lists": {
    title: (title, authorName) => `lists • ${title} by ${authorName} • catalog`,
  },
  "book.notes": {
    title: (title, authorName) => `notes • ${title} by ${authorName} • catalog`,
  },
  "book.posts": {
    title: (title, authorName) => `posts • ${title} by ${authorName} • catalog`,
  },
}

async function getMetadata({ key, params }): Promise<Metadata> {
  const { username, bookSlug, listSlug, shelf } = params

  const config = METADATA_CONFIG[key]

  try {
    if (!config) {
      throw new Error("Missing metadata config")
    }

    let pageTitle
    let pageDescription

    if (username) {
      const _userProfile = await prisma.userProfile.findFirst({
        where: {
          username,
        },
      })

      if (!_userProfile) return {}

      const userProfile = UserProfile.build(_userProfile)

      pageTitle = config.title(userProfile.name)

      if (key === "profile") {
        pageDescription = userProfile.bio || undefined
      } else if (key === "profile.list" || key === "profile.list.edit") {
        if (!listSlug) throw new Error("Missing listSlug for metadata")

        const list = await prisma.list.findFirst({
          where: {
            slug: listSlug,
          },
        })

        if (!list) return {}

        pageTitle = config.title(userProfile.name, list.title)

        if (key === "profile.list") {
          // specifically the list page and not the list edit page
          pageDescription = list.description || undefined
        }
      } else if (key === "profile.shelves.shelf") {
        if (!shelf) throw new Error("Missing shelf for metadata")
        pageTitle = config.title(userProfile.name, shelf)
      }
    } else if (bookSlug) {
      const book = await prisma.book.findFirst({
        where: {
          slug: bookSlug,
        },
      })

      if (!book) return {}

      pageTitle = config.title(book.title, book.authorName)

      if (key === "book") {
        pageDescription = book.description || undefined
      }
    }

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
      },
    }
  } catch (error: any) {
    reportToSentry(error, {
      key,
      params,
    })

    return {}
  }
}

export { getMetadata }
