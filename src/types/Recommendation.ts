import Book from "types/Book"
import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import RecommendationRecipientType from "enums/RecommendationRecipientType"
import RecommendationStatus from "enums/RecommendationStatus"

export default interface Recommendation {
  id: string
  recommenderId: string
  bookId: string
  recipientId: string
  recipientType: RecommendationRecipientType
  note?: string
  status: RecommendationStatus
  createdAt: string | Date
  updatedAt?: string | Date
  // associations below
  recommender?: UserProfile
  book?: Book
  recipient?: UserProfile
}
