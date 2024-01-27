enum UserBookShelf {
  ToRead = "to_read",
  UpNext = "up_next",
  CurrentlyReading = "currently_reading",
  Read = "read",
  Abandoned = "abandoned",
}

const shelfToCopy = {
  [UserBookShelf.ToRead]: "to read",
  [UserBookShelf.UpNext]: "up next",
  [UserBookShelf.CurrentlyReading]: "currently reading",
  [UserBookShelf.Read]: "read",
  [UserBookShelf.Abandoned]: "abandoned",
}

export default UserBookShelf
export { shelfToCopy }
