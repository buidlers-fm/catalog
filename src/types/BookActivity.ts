import { UserProfileProps as UserProfile } from "lib/models/UserProfile"
import UserBookShelf from "enums/UserBookShelf"

export default interface BookActivity {
  totalShelfCounts: Record<UserBookShelf, number>
  totalFavoritedCount: number
  shelvesToFriendsProfiles: Record<UserBookShelf, UserProfile[]>
  likedByFriendsProfiles: UserProfile[]
  favoritedByFriendsProfiles: UserProfile[]
}
