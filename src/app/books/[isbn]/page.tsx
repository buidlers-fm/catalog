import { PiBarcode } from "react-icons/pi"
import type Book from "types/Book"

export default async function BookPage({ params }: any) {
  const { isbn: bookId } = params
  const url = `https://openlibrary.org/books/${bookId}.json`
  const res = await fetch(url)

  if (res.status !== 200) {
    console.log(res)
    const errorMessage = await res.text()
    throw new Error(errorMessage)
  }

  const bookData = await res.json()
  console.log(bookData)

  let work
  const olWorkKey = bookData.works?.[0]?.key
  if (olWorkKey) {
    const workUrl = `https://openlibrary.org/${olWorkKey}.json`
    const res = await fetch(workUrl)
    if (res.status !== 200) {
      console.log(res)
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    work = await res.json()
  }
  console.log(work)

  let authorName
  const olAuthorKey = work.authors?.[0]?.author?.key
  console.log(olAuthorKey)
  if (olAuthorKey) {
    const authorUrl = `https://openlibrary.org/${olAuthorKey}.json`
    const res = await fetch(authorUrl)
    if (res.status !== 200) {
      console.log(res)
      const errorMessage = await res.text()
      throw new Error(errorMessage)
    }
    const author = await res.json()
    authorName = author.name
  }

  let coverImageUrl
  if (bookData && bookData.covers && bookData.covers.length > 0) {
    coverImageUrl = `https://covers.openlibrary.org/b/id/${bookData.covers[0]}-L.jpg`
  }
  if (work && work.covers && work.covers.length > 0) {
    coverImageUrl = `https://covers.openlibrary.org/b/id/${work.covers[0]}-L.jpg`
  }

  const description = work.description?.value || work.description || "No description found."

  const book: Book = {
    title: work.title,
    subtitle: bookData.subtitle,
    by: authorName,
    description,
    coverImageUrl,
    publisherName: bookData.publishers?.[0],
    publishDate: bookData.publish_date,
    isbn: bookData.isbn_13?.[0],
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex">
        <div className="flex-grow-0 flex-shrink-0 w-72">
          <img src={coverImageUrl} alt="cover image" className="object-top shadow-md rounded-md" />
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
            <div>
              <span className="text-gray-200">Published by </span>
              {book.publisherName}
            </div>
            <div className="my-1">
              <PiBarcode className="inline-block align-middle mt-[-6px] text-2xl mr-1 text-gray-200" />
              <span className="text-gray-200">ISBN: </span>
              {book.isbn}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
