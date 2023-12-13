export default interface Like {
  id?: string
  userId: string
  likedObjectId: string
  likedObjectType: string
  createdAt: Date
}
