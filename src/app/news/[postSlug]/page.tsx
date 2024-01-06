import { redirect } from "next/navigation"
import Link from "next/link"
import humps from "humps"
import dayjs from "dayjs"
import * as ghost from "lib/ghost"
import { getMetadata } from "lib/server/metadata"
import { dateTimeFormats } from "lib/constants/dateTime"
import type { Metadata } from "next"

export async function generateMetadata({ params }): Promise<Metadata> {
  return getMetadata({
    key: "news.post",
    params,
  })
}

export default async function CatalogNewsPostPage({ params }) {
  const { postSlug } = params
  let post = await ghost.getPost(postSlug)

  if (!post) redirect("/news")

  post = humps.camelizeKeys(post)

  const { longAmericanDate } = dateTimeFormats
  const publishDate = dayjs(post.publishedAt).format(longAmericanDate).toLowerCase()

  return (
    <div className="px-8 py-12 max-w-2xl mx-auto">
      <div className="text-2xl font-bold font-mulish">{post.title}</div>
      <div className="mt-2 text-gray-300">
        by {post.primaryAuthor.name} • {publishDate}
      </div>
      <div className="cat-news-post my-12" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="mt-12">
        <Link href="/news" className="cat-underline font-mulish">
          back to latest news
        </Link>
      </div>
    </div>
  )
}
