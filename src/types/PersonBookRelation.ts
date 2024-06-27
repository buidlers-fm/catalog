import PersonBookRelationType from "enums/PersonBookRelationType"
import type Book from "types/Book"

export default interface PersonBookRelation {
  id: string
  personId: string
  bookId: string
  relationType: PersonBookRelationType
  createdAt?: string | Date
  updatedAt?: string | Date
  book?: Book
}
