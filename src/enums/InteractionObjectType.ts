enum InteractionObjectType {
  BookNote = "book_note",
  Book = "book",
  Comment = "comment",
  List = "list",
  User = "user_profile",
  UserCurrentStatus = "user_current_status",
}

const interactionObjectTypesToTableNames = {
  [InteractionObjectType.BookNote]: "book_notes",
  [InteractionObjectType.Book]: "books",
  [InteractionObjectType.Comment]: "comments",
  [InteractionObjectType.List]: "lists",
  [InteractionObjectType.User]: "user_profiles",
}

export { interactionObjectTypesToTableNames }
export default InteractionObjectType
