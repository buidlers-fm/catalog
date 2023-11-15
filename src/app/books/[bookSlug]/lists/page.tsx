import { notFound } from "next/navigation"
import prisma from "lib/prisma"
import { decorateLists } from "lib/helpers/general"
import ListCard from "app/components/lists/ListCard"

export const dynamic = "force-dynamic"

export default async function BookListsIndexPage({ params }) {
  const { bookSlug } = params

  const book = await prisma.book.findFirst({
    where: {
      slug: bookSlug,
    },
  })

  if (!book) notFound()

  const _lists = await prisma.list.findMany({
    where: {
      designation: null,
      listItemAssignments: {
        some: {
          listedObjectType: "book",
          listedObjectId: book.id,
        },
      },
    },
    include: {
      listItemAssignments: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  })

  const lists = await decorateLists(_lists)

  return (
    <div className="mt-4 max-w-3xl mx-auto font-mulish">
      <div className="text-sm text-gray-300 uppercase tracking-wider">Lists that include</div>
      <h1 className="my-2 text-4xl font-semibold font-newsreader">{book.title}</h1>
      <div className="mt-4">
        {lists.length > 0 ? (
          <div className="">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} withByline />
            ))}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center font-newsreader italic text-lg text-gray-300">
            {book.title} isn't on any lists yet.
          </div>
        )}
      </div>
    </div>
  )
}
