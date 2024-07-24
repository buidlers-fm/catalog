import type BookNote from "types/BookNote"
import type BookRead from "types/BookRead"
import type UserBookShelfAssignment from "types/UserBookShelfAssignment"
import type UserCurrentStatus from "types/UserCurrentStatus"
import type EditLog from "types/EditLog"

export interface UserProfileProps {
  id: string
  userId: string
  createdAt: Date
  updatedAt?: Date | null
  username: string
  avatarUrl?: string | null
  displayName?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
  config?: any
  bookNotes?: BookNote[]
  bookReads?: BookRead[]
  bookShelfAssignments?: UserBookShelfAssignment[]
  currentStatuses?: UserCurrentStatus[]
  followers?: UserProfileProps[]
  following?: UserProfileProps[]
  editLogs?: EditLog[]
  pins?: any[]
}

export default class UserProfile {
  public id: string

  public userId: string | null | undefined

  public createdAt: Date

  public updatedAt: Date | null | undefined

  public username: string

  public avatarUrl: string | null | undefined

  public displayName: string | null | undefined

  public bio: string | null | undefined

  public location: string | null | undefined

  public website: string | null | undefined

  public config: any | undefined

  public bookNotes: BookNote[] | undefined

  public bookReads: BookRead[] | undefined

  public bookShelfAssignments: UserBookShelfAssignment[] | undefined

  public currentStatuses: UserCurrentStatus[] | undefined

  public followers: UserProfile[] | UserProfileProps[] | undefined

  public following: UserProfile[] | UserProfileProps[] | undefined

  public editLogs: EditLog[] | undefined

  public pins: any[] | undefined

  constructor(userProfileProps: UserProfileProps) {
    this.id = userProfileProps.id
    this.userId = userProfileProps.userId
    this.createdAt = userProfileProps.createdAt
    this.updatedAt = userProfileProps.updatedAt
    this.username = userProfileProps.username
    this.avatarUrl = userProfileProps.avatarUrl
    this.displayName = userProfileProps.displayName
    this.bio = userProfileProps.bio
    this.location = userProfileProps.location
    this.website = userProfileProps.website
    this.config = userProfileProps.config
    this.bookNotes = userProfileProps.bookNotes
    this.bookReads = userProfileProps.bookReads
    this.bookShelfAssignments = userProfileProps.bookShelfAssignments
    this.currentStatuses = userProfileProps.currentStatuses
    this.editLogs = userProfileProps.editLogs
    this.pins = userProfileProps.pins

    if (userProfileProps.followers) {
      this.followers = UserProfile.buildMany(userProfileProps.followers)
    }
    if (userProfileProps.following) {
      this.following = UserProfile.buildMany(userProfileProps.following)
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
}
