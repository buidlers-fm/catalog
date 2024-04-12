enum Visibility {
  Public = "public",
  SignedIn = "signed_in",
  Friends = "friends",
  Self = "self",
  None = "none",
}

const visibilitySettingsCopy = {
  [Visibility.Public]: "public",
  [Visibility.SignedIn]: "signed-in users",
  [Visibility.Friends]: "users I follow",
  [Visibility.Self]: "only me",
  [Visibility.None]: "no one",
}

const visibilityCopy = {
  [Visibility.Public]: "public",
  [Visibility.SignedIn]: "signed-in users",
  [Visibility.Friends]: "friends",
  [Visibility.Self]: "only you",
}

const visibilitySettingsOptions = {
  notesVisibility: {
    options: [Visibility.Public, Visibility.SignedIn, Visibility.Friends, Visibility.Self],
    default: Visibility.Public,
  },
  shelvesVisibility: {
    options: [Visibility.Public, Visibility.SignedIn, Visibility.Friends, Visibility.Self],
    default: Visibility.Public,
  },
  currentStatusVisibility: {
    options: [Visibility.Public, Visibility.SignedIn, Visibility.Friends],
    default: Visibility.Public,
  },
  userSearchVisibility: {
    options: [Visibility.SignedIn, Visibility.Friends, Visibility.None],
    default: Visibility.SignedIn,
  },
}

export default Visibility
export { visibilitySettingsCopy, visibilityCopy, visibilitySettingsOptions }
