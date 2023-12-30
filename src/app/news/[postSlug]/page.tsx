import Link from "next/link"
import humps from "humps"
import * as ghost from "lib/ghost"

export default async function CatalogNewsPostPage({ params }) {
  const { postSlug } = params
  let post = await ghost.getPost(postSlug)

  post = humps.camelizeKeys(post)

  return (
    <div className="px-8 py-12 max-w-2xl mx-auto">
      <div className="text-2xl font-bold font-mulish">{post.title}</div>
      <div className="mt-2 text-gray-300">by {post.primaryAuthor.name}</div>
      <div className="cat-news-post my-12" dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="mt-12">
        <Link href="/news" className="cat-underline font-mulish">
          back to latest news
        </Link>
      </div>
    </div>
  )
}
