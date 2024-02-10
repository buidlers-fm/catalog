last updated: february 10, 2024.

# big things for jan-feb 2024

key: 🛠️ in progress | ✅ done | ⌛️ upcoming

- ✅ In-app notifications for likes, comments, etc.
- ✅ Comment on all the things (including on other comments, in some cases).
- ✅ Instead of just link posts, book posts can have text and become full discussion threads.
- 🛠️ Allow catalog users to edit book details and covers, and add new books.
  - Sync these changes back to OpenLibrary if possible.
- ⌛️ Allow users to set privacy/visibility levels on notes, shelves, and status.

---

# changelog

A running journal of things we've been working on around catalog. 🛠️ 🚧

## february 5-11, 2024

Small fixes/improvements:

- Search: fixed bug so that we _actually_ strip leading articles from search term
- Fixed bug where it would let you log an empty book edit even without changing any fields
- Updated copy on edit book form to be clearer
- Improved messaging around password reset and related errors
- Upgraded to Next.js 14+ to fix some issues caused by Next.js bugs
- Improved auth error handling (no more "white screen of death")
- Various other styling, copy, UX tweaks

## january 29 - february 4, 2024

Main things:

- Users can edit book details and covers
  - (Not done yet: ability to add a new book; syncing back to OpenLibrary)
- User profile shows the user's edit history
- Added a leaderboard of users who have edited the most books

Small fixes/improvements:

- @-mentions: Fixed bug when @-mentioning someone on mobile
- Search: Expand search to allow results from OpenLibrary that have an OCLC or LCCN code but no ISBN (previously all results required an ISBN)
- Search: Strip leading articles from search term for (hopefully) better search results
- Various styling tweaks

## january 22-28, 2024

Main things:

- Comments on comments
- Book posts can have text as well as a link URL, and thus become full discussion threads
- Spoilers toggle in book notes and posts - thanks [@brianmcgue](https://catalog.fyi/users/brianmcgue) for working on this!
- Added feedback form in the app

Small fixes/improvements:

- Waitlist dashboard for admins
- Show who liked something
- Show shelf counts, obsessed (top 4) counts, and friends' activity on book page

## january 15-21, 2024

Main things:

- Notifications for follows, likes, and comments
- Enable comments on notes and lists
- Enable @-mentions in most long-text fields
- Added "Forgot password" flow
- Created this changelog!

Small fixes/improvements:

- User can like a current status
- Update signed-in homepage
- Add waitlist link to sign-in form
- Hide raw error messages
- Add tooltip to read dates link in book note modal
- Update the guide with tips, and add a sticky sidebar

## january 8-14, 2024

Main things:

- Finished work on uploading covers to our database, so that we're less reliant on OpenLibrary for cover images
- Comments on book links
- Edit, delete, like, and unlike a comment
- Replaced avatar upload component with our own home-rolled one - thanks [@brianmcgue](https://catalog.fyi/users/brianmcgue) for working on this!
- Added ability to search users in the nav bar

Small fixes/improvements:

- Updated the guide
- Added Discord link in footer
- Newsletter opt-in on signup
- Signing up for the waitlist automatically subscribes you to the newsletter if you opted in
- Limit friends' current statuses to past 2 weeks
- Use dropdown nav for user shelves on small screens
- Try again to fix tapping a list book on mobile
- Prevent long URLs/words from overflowing the text's container
- Show whether a book note's creator loved the book
- Fixed newsletter subscribe which was briefly broken by our domain update
- Differentiate between read vs. unread announcements (envelope state at top right)
- Misc tiny bug fixes
