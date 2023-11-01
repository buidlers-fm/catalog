export default interface Book {
  id?: string
  title: string
  subtitle?: string
  by: string
  description?: string
  coverImageUrl: string
  publisherName?: string
  publishDate?: string
  openlibraryBookId?: string
  openlibraryWorkId: string
}
