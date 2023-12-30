import Link from "next/link"
import humps from "humps"
import { FaRss } from "react-icons/fa"
import * as ghost from "lib/ghost"
import { truncateString } from "lib/helpers/general"
import GhostSubscribe from "app/components/GhostSubscribe"

export default async function CatalogNewsHome() {
  let posts = await ghost.getAllPosts()
  posts = humps.camelizeKeys(posts)

  return (
    <div className="px-8 py-12 max-w-2xl mx-auto">
      <div className="flex justify-between">
        <div className="cat-eyebrow">latest news</div>
        <Link href="/news/rss" target="_blank">
          <FaRss className="mt-1 mr-1 text-gray-300 text-sm" />
        </Link>
      </div>
      <hr className="my-1 h-[1px] border-none bg-gray-300" />
      {posts.map((post) => (
        <div key={post.id} className="py-8 border-b border-b-gray-500 last:border-none">
          <div className="text-2xl font-semibold font-mulish">
            <Link href={`/news/${post.slug}`} className="cat-underline">
              {post.title}
            </Link>
          </div>
          <div className="mt-2 text-gray-300 font-mulish">by {post.primaryAuthor.name}</div>
          <div className="mt-2">{truncateString(post.excerpt, 200)}</div>
        </div>
      ))}

      <div className="mt-24">
        <GhostSubscribe />
      </div>
    </div>
  )
}
