enum InteractionObjectType {
  BookNote = "book_note",
  Book = "book",
  Comment = "comment",
  List = "list",
  User = "user_profile",
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
