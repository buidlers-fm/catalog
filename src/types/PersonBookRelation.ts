import PersonBookRelationType from "enums/PersonBookRelationType"
import type Book from "types/Book"
import type Person from "types/Person"

export default interface PersonBookRelation {
  id: string
  personId: string
  bookId: string
  relationType: PersonBookRelationType
  createdAt?: string | Date
  updatedAt?: string | Date
  book?: Book
  person?: Person
}
