import PersonBookRelationType from "enums/PersonBookRelationType"
import type Book from "types/Book"
import type Person from "types/Person"

enum PersonBookRelationSourceType {
  Acknowledgements = "acknowledgements",
  Credits = "credits",
  BookInterior = "book_interior",
  Person = "person",
}

export default interface PersonBookRelation {
  id: string
  personId: string
  bookId: string
  relationType: PersonBookRelationType
  detail?: string
  orgName?: string
  sourceType?: PersonBookRelationSourceType
  createdAt?: string | Date
  updatedAt?: string | Date
  book?: Book
  person?: Person
}
