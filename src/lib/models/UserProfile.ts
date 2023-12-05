export interface UserProfileProps {
  id: string;
  userId: string
  createdAt: Date
  username: string
  avatarUrl?: string | null
  displayName?: string | null
  bio?: string | null
  location?: string | null
  website?: string | null
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
