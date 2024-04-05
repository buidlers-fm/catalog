enum Visibility {
  Public = "public",
  SignedIn = "signed_in",
  Friends = "friends",
  Self = "self",
}

const visibilitySettingsCopy = {
  [Visibility.Public]: "public",
  [Visibility.SignedIn]: "signed-in users",
  [Visibility.Friends]: "users I follow",
  [Visibility.Self]: "only me",
}

const visibilityCopy = {
  [Visibility.Public]: "public",
  [Visibility.SignedIn]: "signed-in users",
  [Visibility.Friends]: "friends",
  [Visibility.Self]: "only you",
}

export default Visibility
export { visibilitySettingsCopy, visibilityCopy }
