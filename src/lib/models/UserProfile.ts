import type BookNote from "types/BookNote"
import type BookRead from "types/BookRead"
import type UserCurrentStatus from "types/UserCurrentStatus"

export interface UserProfileProps {
  id: string
  userId: string
  createdAt: Date
  username: string
  avatarUrl?: string | null
  displayName?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  bookNotes?: BookNote[]
  bookReads?: BookRead[]
  currentStatuses?: UserCurrentStatus[]
  followers?: UserProfileProps[]
}

export default class UserProfile {
  public id: string

  public userId: string | null | undefined

  public createdAt: Date

  public username: string

  public avatarUrl: string | null | undefined

  public displayName: string | null | undefined

  public bio: string | null | undefined

  public location: string | null | undefined

  public website: string | null | undefined

  public bookNotes: BookNote[] | undefined

  public bookReads: BookRead[] | undefined

  public currentStatuses: UserCurrentStatus[] | undefined

  public followers: UserProfile[] | UserProfileProps[] | undefined

  public following: UserProfile[] | UserProfileProps[] | undefined

  constructor(userProfileProps: UserProfileProps) {
    this.id = userProfileProps.id
    this.userId = userProfileProps.userId
    this.createdAt = userProfileProps.createdAt
    this.username = userProfileProps.username
    this.avatarUrl = userProfileProps.avatarUrl
    this.displayName = userProfileProps.displayName
    this.bio = userProfileProps.bio
    this.location = userProfileProps.location
    this.website = userProfileProps.website
    this.bookNotes = userProfileProps.bookNotes
    this.bookReads = userProfileProps.bookReads
    this.currentStatuses = userProfileProps.currentStatuses

    if (userProfileProps.followers) {
      this.followers = UserProfile.buildMany(userProfileProps.followers)
    }
  }

  static buildMany(queryResults: UserProfileProps[]): UserProfile[] {
    if (!queryResults) return []

    return queryResults.map(
      (queryResult: UserProfileProps): UserProfile => new UserProfile(queryResult),
    )
  }

  static build(queryResult: UserProfileProps): UserProfile {
    return new UserProfile(queryResult)
  }

  get name(): string {
    return this.displayName || this.username
  }

  isFollowedBy(otherUser: UserProfile): boolean {
    return !!this.followers?.find((follower) => follower.id === otherUser.id)
  }
}
