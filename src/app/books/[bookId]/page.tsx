import Link from "next/link"
import { GiOpenBook } from "react-icons/gi"
import OpenLibrary from "lib/openlibrary"
import type Book from "types/Book"

export default async function BookPage({ params }: any) {
  const { bookId } = params
  const book: Book = await OpenLibrary.getFullBook(bookId)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex">
        <div className="flex-grow-0 flex-shrink-0 w-72">
          {book.coverImageUrl ? (
            <img src={book.coverImageUrl} alt="cover" className="object-top shadow-md rounded-md" />
          ) : (
            <div className="w-[288px] h-[460px] shrink-0 flex items-center justify-center border-2 border-gray-500 box-border rounded">
              <GiOpenBook className="mt-0 text-9xl text-gray-500" />
            </div>
          )}
        </div>
        <div className="flex-grow ml-16">
          <h1 className="mb-1 text-4xl font-semibold">
            {book.title}
            <span className="text-xl ml-3 font-normal text-gray-200">{book.publishDate}</span>
          </h1>
          {book.subtitle && <h2 className="my-2 text-xl italic">{book.subtitle}</h2>}
          <h2 className="my-2 text-xl">by {book.by}</h2>
          <div className="my-8 whitespace-pre-wrap w-5/6">{book.description}</div>
          <div className="my-8">
            {book.openlibraryId && (
              <div className="my-2">
                <span className="text-gray-200">More at</span>{" "}
                <Link
                  href={OpenLibrary.getOlWorkPageUrl(bookId)}
                  className="cat-underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenLibrary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
