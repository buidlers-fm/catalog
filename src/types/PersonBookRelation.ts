import PersonBookRelationType from "enums/PersonBookRelationType"

export default interface PersonBookRelation {
  id: string
  personId: string
  bookId: string
  relationType: PersonBookRelationType
  createdAt?: string | Date
  updatedAt?: string | Date
}
